import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bookings, blockedDates } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { generateICS, type ICalEvent } from "@/lib/ical";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  // Verify token
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.icalToken, token)))
    .limit(1);

  if (!property) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Get confirmed/checked_in bookings
  const confirmedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        inArray(bookings.status, ["confirmed", "checked_in"])
      )
    );

  // Get blocked dates
  const blocked = await db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.propertyId, propertyId));

  // Build events
  const events: ICalEvent[] = [];

  for (const b of confirmedBookings) {
    events.push({
      uid: b.id,
      summary: "Занято",
      dateFrom: b.checkIn,
      dateTo: b.checkOut,
    });
  }

  for (const bd of blocked) {
    events.push({
      uid: bd.id,
      summary: bd.reason || "Blocked",
      dateFrom: bd.dateFrom,
      dateTo: bd.dateTo,
    });
  }

  const ics = generateICS(events, `RentPro — ${property.name}`);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="rentpro-${propertyId}.ics"`,
      "Cache-Control": "no-cache, no-store",
    },
  });
}
