import { db } from "@/lib/db";
import { properties, bookings, priceRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Kazakhstan holidays (fixed dates)
const KZ_HOLIDAYS = [
  "01-01", "01-02", // New Year
  "03-08", // Women's Day
  "03-21", "03-22", "03-23", // Nauryz
  "05-01", // Unity Day
  "05-07", // Defender Day
  "05-09", // Victory Day
  "07-06", // Capital Day
  "08-30", // Constitution Day
  "10-25", // Republic Day
  "12-01", // First President Day
  "12-16", "12-17", // Independence Day
];

function isHoliday(date: Date): boolean {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return KZ_HOLIDAYS.includes(mmdd);
}

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export interface DailyPrice {
  date: string;
  basePrice: number;
  finalPrice: number;
  reason: string;
  multiplier: number;
}

// Calculate dynamic price for a specific date and property
export async function calculateDailyPrice(
  propertyId: string,
  dateStr: string,
): Promise<DailyPrice> {
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!property) {
    return { date: dateStr, basePrice: 0, finalPrice: 0, reason: "not_found", multiplier: 1 };
  }

  const date = new Date(dateStr);
  let basePrice = property.priceWeekday;
  let reason = "weekday";
  let multiplier = 1;

  // Weekend pricing
  if (isWeekend(date)) {
    basePrice = property.priceWeekend || property.priceWeekday;
    reason = "weekend";
    multiplier = basePrice / property.priceWeekday;
  }

  // Holiday pricing (higher than weekend)
  if (isHoliday(date)) {
    basePrice = property.priceHoliday || property.priceWeekend * 1.3 || property.priceWeekday * 1.5;
    reason = "holiday";
    multiplier = basePrice / property.priceWeekday;
  }

  // Check custom price rules
  const rules = await db.select().from(priceRules).where(eq(priceRules.propertyId, propertyId));

  for (const rule of rules) {
    if (rule.dateFrom && rule.dateTo && dateStr >= rule.dateFrom && dateStr <= rule.dateTo) {
      if (rule.priceOverride) {
        basePrice = rule.priceOverride;
        reason = `rule: ${rule.name}`;
        multiplier = basePrice / property.priceWeekday;
      } else if (rule.multiplier) {
        basePrice = property.priceWeekday * rule.multiplier;
        reason = `rule: ${rule.name}`;
        multiplier = rule.multiplier;
      }
      break; // First matching rule wins
    }
  }

  // Dynamic pricing based on occupancy (auto-surge)
  const occupancyMultiplier = await getOccupancySurge(propertyId, dateStr);
  const finalPrice = Math.round(basePrice * occupancyMultiplier);

  return {
    date: dateStr,
    basePrice: Math.round(basePrice),
    finalPrice,
    reason: occupancyMultiplier > 1 ? `${reason} + high demand (x${occupancyMultiplier.toFixed(1)})` : reason,
    multiplier: multiplier * occupancyMultiplier,
  };
}

// Surge pricing based on how many properties are booked on that date
async function getOccupancySurge(propertyId: string, dateStr: string): Promise<number> {
  // Get the owner's total properties
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (!property) return 1;

  const allProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, property.userId));

  const allBookings = await db.select().from(bookings);

  // Count how many properties are booked on this date
  const bookedCount = allProperties.filter((p) =>
    allBookings.some(
      (b) =>
        b.propertyId === p.id &&
        b.status !== "cancelled" &&
        b.checkIn <= dateStr &&
        b.checkOut > dateStr
    )
  ).length;

  const totalCount = allProperties.length;
  if (totalCount <= 1) return 1;

  const occupancyRate = bookedCount / totalCount;

  // Surge rules:
  // < 50% occupancy: no surge
  // 50-75%: +10%
  // 75-90%: +20%
  // > 90%: +30%
  if (occupancyRate >= 0.9) return 1.3;
  if (occupancyRate >= 0.75) return 1.2;
  if (occupancyRate >= 0.5) return 1.1;
  return 1;
}

// Calculate total price for a date range
export async function calculateRangePrice(
  propertyId: string,
  checkIn: string,
  checkOut: string,
): Promise<{ total: number; nights: number; dailyPrices: DailyPrice[] }> {
  const dailyPrices: DailyPrice[] = [];
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let total = 0;

  const current = new Date(start);
  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    const price = await calculateDailyPrice(propertyId, dateStr);
    dailyPrices.push(price);
    total += price.finalPrice;
    current.setDate(current.getDate() + 1);
  }

  return { total, nights: dailyPrices.length, dailyPrices };
}
