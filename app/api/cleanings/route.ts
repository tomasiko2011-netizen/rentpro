import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cleanings, bookings, properties } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const status = url.searchParams.get("status");

  const all = await db.select().from(cleanings).where(eq(cleanings.userId, userId));

  let filtered = all;
  if (from) filtered = filtered.filter(c => c.date >= from);
  if (to) filtered = filtered.filter(c => c.date <= to);
  if (status) filtered = filtered.filter(c => c.status === status);

  // Sort by date
  filtered.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const [cleaning] = await db.insert(cleanings).values({
    ...body,
    userId,
  }).returning();

  return NextResponse.json(cleaning, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.update(cleanings).set(updates).where(
    and(eq(cleanings.id, id), eq(cleanings.userId, userId))
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await req.json();

  await db.delete(cleanings).where(
    and(eq(cleanings.id, id), eq(cleanings.userId, userId))
  );

  return NextResponse.json({ ok: true });
}
