import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { priceRules, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function ownsProperty(userId: string, propertyId: string) {
  const [p] = await db.select({ id: properties.id }).from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId))).limit(1);
  return !!p;
}
const userIdOf = (session: { user?: unknown }) => (session.user as { id: string }).id;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");
  if (!propertyId) return NextResponse.json({ error: "propertyId required" }, { status: 400 });
  if (!(await ownsProperty(userIdOf(session), propertyId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rules = await db.select().from(priceRules).where(eq(priceRules.propertyId, propertyId));
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { propertyId, name, type, dateFrom, dateTo, priceOverride, multiplier } = await req.json();
  if (!propertyId || !(await ownsProperty(userIdOf(session), propertyId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [rule] = await db.insert(priceRules).values({ propertyId, name, type, dateFrom, dateTo, priceOverride, multiplier }).returning();
  return NextResponse.json(rule, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [rule] = await db.select().from(priceRules).where(eq(priceRules.id, id)).limit(1);
  if (!rule || !(await ownsProperty(userIdOf(session), rule.propertyId))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(priceRules).where(eq(priceRules.id, id));
  return NextResponse.json({ ok: true });
}
