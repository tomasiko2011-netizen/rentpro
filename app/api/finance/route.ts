import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const result = await db.select().from(transactions).where(eq(transactions.userId, userId));

  const income = result.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = result.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return NextResponse.json({ transactions: result, summary: { income, expense, profit: income - expense } });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const [tx] = await db.insert(transactions).values({ ...body, userId }).returning();
  return NextResponse.json(tx, { status: 201 });
}
