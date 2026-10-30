import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { and, eq, like } from "drizzle-orm";
import { pusherServer, EVENTS } from "@/lib/pusher";
import { sendWhatsApp, templates } from "@/lib/waha";

// Kaspi Pay webhook — called when payment is completed
export async function POST(req: NextRequest) {
  try {
    // Пока нет HMAC от Kaspi: секрет в callbackUrl обязателен, без него вебхук закрыт
    const secret = process.env.KASPI_WEBHOOK_SECRET;
    if (!secret || req.nextUrl.searchParams.get("secret") !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Extract payment info from Kaspi callback
    const { orderId, status, amount } = body;

    if (!orderId || status !== "completed") {
      return NextResponse.json({ ok: true });
    }

    // orderId format: "RP-XXXXXXXX" where XXXXXXXX is first 8 chars of booking ID
    const bookingPrefix = String(orderId).replace(/^RP-/, "").toLowerCase();
    if (!/^[0-9a-f]{8}$/.test(bookingPrefix)) {
      return NextResponse.json({ error: "Bad orderId" }, { status: 400 });
    }

    const matches = await db.select().from(bookings).where(
      and(like(bookings.id, `${bookingPrefix}%`), eq(bookings.paymentStatus, "pending"))
    );
    const booking = matches.length === 1 ? matches[0] : undefined;

    if (!booking) {
      console.error("Kaspi webhook: booking not found for", orderId);
      return NextResponse.json({ ok: true });
    }

    // Update booking: payment confirmed
    const [updated] = await db
      .update(bookings)
      .set({
        paymentStatus: "paid",
        status: "confirmed",
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    // Notify owner via Pusher
    try {
      await pusherServer.trigger(
        `user-${booking.userId}`,
        EVENTS.BOOKING_UPDATED,
        updated
      );
    } catch {}

    // WhatsApp to guest: payment confirmed
    if (booking.guestPhone) {
      try {
        await sendWhatsApp({
          phone: booking.guestPhone,
          text: `✅ Оплата получена!\n\nВаше бронирование подтверждено.\nСумма: ${booking.totalPrice.toLocaleString("ru-KZ")} ₸\n\nДобро пожаловать! 🏠`,
        });
      } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Kaspi webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
