import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [property] = await db.select().from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!property || property.status !== "active") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get booked dates for next 90 days
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 90);
  const nowStr = now.toISOString().split("T")[0];
  const futureStr = futureDate.toISOString().split("T")[0];

  const propertyBookings = await db.select().from(bookings)
    .where(eq(bookings.propertyId, id));

  const bookedRanges = propertyBookings
    .filter((b) => b.status !== "cancelled" && b.checkOut > nowStr && b.checkIn < futureStr)
    .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }));

  return NextResponse.json({
    id: property.id,
    name: property.name,
    type: property.type,
    address: property.address,
    city: property.city,
    rooms: property.rooms,
    beds: property.beds,
    maxGuests: property.maxGuests,
    description: property.description,
    photos: property.photos,
    amenities: property.amenities,
    priceWeekday: property.priceWeekday,
    priceWeekend: property.priceWeekend,
    minNights: property.minNights,
    checkInTime: property.checkInTime,
    checkOutTime: property.checkOutTime,
    bookedRanges,
  });
}
