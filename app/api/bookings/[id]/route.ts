import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { pusherServer, EVENTS } from "@/lib/pusher";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  // Recalculate nights if dates changed
  if (body.checkIn && body.checkOut) {
    const nights = Math.ceil(
      (new Date(body.checkOut).getTime() - new Date(body.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    body.nights = nights;
  }

  const [updated] = await db.update(bookings)
    .set(body)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await pusherServer.trigger(`user-${userId}`, EVENTS.BOOKING_UPDATED, updated);
  } catch {}

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  await db.delete(bookings).where(and(eq(bookings.id, id), eq(bookings.userId, userId)));

  try {
    await pusherServer.trigger(`user-${userId}`, EVENTS.BOOKING_DELETED, { id });
  } catch {}

  return NextResponse.json({ ok: true });
}
