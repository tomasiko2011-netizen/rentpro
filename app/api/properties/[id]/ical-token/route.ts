import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  // Verify ownership
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, userId)))
    .limit(1);

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Generate new token
  const token = crypto.randomUUID();
  await db.update(properties).set({ icalToken: token }).where(eq(properties.id, id));

  const baseUrl = process.env.NEXTAUTH_URL || "https://booking.truest.kz";
  const exportUrl = `${baseUrl}/api/ical/${id}?token=${token}`;

  return NextResponse.json({ token, exportUrl });
}
