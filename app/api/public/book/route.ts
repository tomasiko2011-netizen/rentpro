import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, properties, guests, transactions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWhatsApp, templates } from "@/lib/waha";
import { pusherServer, EVENTS } from "@/lib/pusher";
import { createKaspiPayment, formatPaymentMessage } from "@/lib/kaspi";
import { checkAvailability } from "@/lib/availability";
import { calculateRangePrice } from "@/lib/pricing";
import { createNotification } from "@/lib/notify";

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

    // Check availability (bookings + blocked dates from iCal)
    const { available, reason } = await checkAvailability(propertyId, checkIn, checkOut);
    if (!available) {
      return NextResponse.json({ error: reason }, { status: 409 });
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

    // Dynamic pricing: weekday/weekend/holiday/surge
    const rangePrice = await calculateRangePrice(propertyId, checkIn, checkOut);
    const totalPrice = rangePrice.total;

    // Find or create guest (deduplicate by phone)
    let guest;
    const existingGuests = await db.select().from(guests)
      .where(eq(guests.userId, property.userId));
    const normalPhone = guestPhone.replace(/[\s\-+]/g, "");
    guest = existingGuests.find(g => g.phone?.replace(/[\s\-+]/g, "") === normalPhone);
    if (!guest) {
      [guest] = await db.insert(guests).values({
        userId: property.userId,
        name: guestName,
        phone: guestPhone,
        email: guestEmail || null,
      }).returning();
    } else if (guestEmail && !guest.email) {
      await db.update(guests).set({ email: guestEmail }).where(eq(guests.id, guest.id));
    }

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

    // Notification + Pusher
    await createNotification(property.userId, "booking", "Новое бронирование с сайта", `${guestName} (${guestPhone}) — ${checkIn} → ${checkOut}, ${totalPrice.toLocaleString("ru-KZ")} ₸`);
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

    // WhatsApp: notify owner
    try {
      const [owner] = await db.select().from(users).where(eq(users.id, property.userId)).limit(1);
      if (owner?.phone) {
        await sendWhatsApp({
          phone: owner.phone,
          text: templates.newBookingOwner(guestName, guestPhone, property.name, checkIn, checkOut, totalPrice),
        });
      }
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
