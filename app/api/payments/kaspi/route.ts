import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer, EVENTS } from "@/lib/pusher";
import { sendWhatsApp, templates } from "@/lib/waha";

// Kaspi Pay webhook — called when payment is completed
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract payment info from Kaspi callback
    const { orderId, status, amount } = body;

    if (!orderId || status !== "completed") {
      return NextResponse.json({ ok: true });
    }

    // orderId format: "RP-XXXXXXXX" where XXXXXXXX is first 8 chars of booking ID
    const bookingPrefix = orderId.replace("RP-", "").toLowerCase();

    // Find booking by prefix match
    const allBookings = await db.select().from(bookings);
    const booking = allBookings.find(
      (b) => b.id.startsWith(bookingPrefix) && b.paymentStatus === "pending"
    );

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
