import { db } from "@/lib/db";
import { bookings, blockedDates } from "@/lib/db/schema";
import { eq, and, ne, lt, gt } from "drizzle-orm";

/**
 * Check if a property is available for a date range.
 * Checks both bookings (all non-cancelled) and blockedDates (iCal imports).
 */
export async function checkAvailability(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): Promise<{ available: boolean; reason?: string }> {
  // Check bookings overlap: b.checkIn < checkOut AND b.checkOut > checkIn
  const conflictingBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        ne(bookings.status, "cancelled"),
        lt(bookings.checkIn, checkOut),
        gt(bookings.checkOut, checkIn),
        excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined
      )
    )
    .limit(1);

  if (conflictingBookings.length > 0) {
    return { available: false, reason: "Даты заняты (бронирование)" };
  }

  // Check blocked dates overlap
  const conflictingBlocked = await db
    .select({ id: blockedDates.id })
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.propertyId, propertyId),
        lt(blockedDates.dateFrom, checkOut),
        gt(blockedDates.dateTo, checkIn)
      )
    )
    .limit(1);

  if (conflictingBlocked.length > 0) {
    return { available: false, reason: "Даты заблокированы (внешняя площадка)" };
  }

  return { available: true };
}
