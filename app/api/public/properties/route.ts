import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { properties, bookings } from "@/lib/db/schema";
import { eq, and, or, gte, lte } from "drizzle-orm";

// Public API — no auth required. Returns active properties with availability.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city");
  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");
  const guests = url.searchParams.get("guests");

  // Get all active properties
  let allProperties = await db.select().from(properties).where(eq(properties.status, "active"));

  // Filter by city
  if (city) {
    allProperties = allProperties.filter((p) =>
      p.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  // Filter by guest count
  if (guests) {
    const g = parseInt(guests);
    allProperties = allProperties.filter((p) => p.maxGuests >= g);
  }

  // Filter by availability (exclude properties with overlapping bookings)
  if (checkIn && checkOut) {
    const allBookings = await db.select().from(bookings);
    const busyPropertyIds = new Set(
      allBookings
        .filter(
          (b) =>
            b.status !== "cancelled" &&
            b.checkIn < checkOut &&
            b.checkOut > checkIn
        )
        .map((b) => b.propertyId)
    );

    allProperties = allProperties.filter((p) => !busyPropertyIds.has(p.id));
  }

  // Return public-safe data (no userId)
  const result = allProperties.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    address: p.address,
    city: p.city,
    rooms: p.rooms,
    beds: p.beds,
    maxGuests: p.maxGuests,
    description: p.description,
    photos: p.photos,
    amenities: p.amenities,
    priceWeekday: p.priceWeekday,
    priceWeekend: p.priceWeekend,
    minNights: p.minNights,
    checkInTime: p.checkInTime,
    checkOutTime: p.checkOutTime,
  }));

  return NextResponse.json(result);
}
