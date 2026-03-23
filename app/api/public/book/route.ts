import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, properties, guests, transactions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendWhatsApp, templates } from "@/lib/waha";
import { pusherServer, EVENTS } from "@/lib/pusher";
import { createKaspiPayment, formatPaymentMessage } from "@/lib/kaspi";

// Public booking — no auth required. Guest books directly.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, checkIn, checkOut, guestName, guestPhone, guestEmail } = body;

    if (!propertyId || !checkIn || !checkOut || !guestName || !guestPhone) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    // Get property
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property || property.status !== "active") {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    }

    // Check overlap
    const existing = await db.select().from(bookings).where(eq(bookings.propertyId, propertyId));
    const hasOverlap = existing.some(
      (b) =>
        b.status !== "cancelled" &&
        b.checkIn < checkOut &&
        b.checkOut > checkIn
    );

    if (hasOverlap) {
      return NextResponse.json({ error: "Даты заняты" }, { status: 409 });
    }

    // Calculate price
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < property.minNights) {
      return NextResponse.json(
        { error: `Минимум ${property.minNights} ноч.` },
        { status: 400 }
      );
    }

    // Simple pricing: weekday price * nights (TODO: weekend/holiday pricing)
    const totalPrice = nights * property.priceWeekday;

    // Create or find guest
    const [guest] = await db
      .insert(guests)
      .values({
        userId: property.userId,
        name: guestName,
        phone: guestPhone,
        email: guestEmail || null,
      })
      .returning();

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        propertyId,
        guestId: guest.id,
        userId: property.userId,
        checkIn,
        checkOut,
        nights,
        totalPrice,
        status: "pending",
        source: "widget",
        paymentStatus: "pending",
        guestName,
        guestPhone,
      })
      .returning();

    // Create income transaction
    await db.insert(transactions).values({
      userId: property.userId,
      propertyId,
      bookingId: booking.id,
      type: "income",
      category: "Бронирование",
      amount: totalPrice,
      date: checkIn,
      description: `${guestName} — ${nights} ноч. (сайт)`,
    });

    // Notify owner via Pusher
    try {
      await pusherServer.trigger(`user-${property.userId}`, EVENTS.BOOKING_CREATED, booking);
    } catch {}

    // Generate Kaspi payment
    const payment = await createKaspiPayment({
      bookingId: booking.id,
      amount: totalPrice,
      description: `${property.name} — ${nights} ноч.`,
    });

    // WhatsApp: confirm + payment link to guest
    try {
      const confirmMsg = templates.bookingConfirmed(guestName, property.name, checkIn, checkOut, totalPrice);
      const paymentMsg = formatPaymentMessage(totalPrice, payment.paymentId, payment.paymentUrl);
      await sendWhatsApp({
        phone: guestPhone,
        text: `${confirmMsg}\n\n${paymentMsg}`,
      });
    } catch {}

    return NextResponse.json({
      id: booking.id,
      property: property.name,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      status: "pending",
      paymentId: payment.paymentId,
      paymentUrl: payment.paymentUrl || null,
      message: "Бронирование создано! Оплатите через Kaspi Pay.",
    });
  } catch (error) {
    console.error("Public booking error:", error);
    return NextResponse.json({ error: "Ошибка бронирования" }, { status: 500 });
  }
}
