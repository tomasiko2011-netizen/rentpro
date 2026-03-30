import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, guests, properties, transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer, EVENTS } from "@/lib/pusher";
import { sendWhatsApp, templates } from "@/lib/waha";
import { checkAvailability } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = db.select().from(bookings).where(eq(bookings.userId, userId));

  // We'll filter in JS for simplicity with multiple optional conditions
  const result = await query;
  let filtered = result;

  if (propertyId) filtered = filtered.filter(b => b.propertyId === propertyId);
  if (status) filtered = filtered.filter(b => b.status === status);
  if (from) filtered = filtered.filter(b => b.checkOut >= from);
  if (to) filtered = filtered.filter(b => b.checkIn <= to);

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  // Check availability (bookings + blocked dates from iCal)
  const { available, reason } = await checkAvailability(body.propertyId, body.checkIn, body.checkOut);
  if (!available) {
    return NextResponse.json({ error: reason }, { status: 409 });
  }

  // Auto-create guest if guestName + guestPhone provided
  let guestId = body.guestId;
  if (!guestId && body.guestName && body.guestPhone) {
    const [guest] = await db.insert(guests).values({
      userId,
      name: body.guestName,
      phone: body.guestPhone,
    }).returning();
    guestId = guest.id;
  }

  // Calculate nights
  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const [booking] = await db.insert(bookings).values({
    ...body,
    userId,
    guestId,
    nights,
  }).returning();

  // Auto-create income transaction
  if (booking.totalPrice > 0) {
    await db.insert(transactions).values({
      userId,
      propertyId: booking.propertyId,
      bookingId: booking.id,
      type: "income",
      category: "Бронирование",
      amount: booking.totalPrice,
      date: booking.checkIn,
      description: `${body.guestName || "Гость"} — ${nights} ноч.`,
    });
  }

  // Update guest stats
  if (guestId) {
    const guestBookings = await db.select().from(bookings).where(eq(bookings.guestId, guestId));
    const totalSpent = guestBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    await db.update(guests).set({
      totalBookings: guestBookings.length,
      totalSpent,
    }).where(eq(guests.id, guestId));
  }

  // Pusher realtime
  try {
    await pusherServer.trigger(`user-${userId}`, EVENTS.BOOKING_CREATED, booking);
  } catch {}

  // WhatsApp notification to owner
  const ownerPhone = session.user.email; // TODO: use actual phone from user profile
  const [property] = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
  if (body.guestPhone && property) {
    try {
      await sendWhatsApp({
        phone: body.guestPhone,
        text: templates.bookingConfirmed(
          body.guestName || "Гость",
          property.name,
          body.checkIn,
          body.checkOut,
          booking.totalPrice,
        ),
      });
    } catch {}
  }

  return NextResponse.json(booking, { status: 201 });
}
