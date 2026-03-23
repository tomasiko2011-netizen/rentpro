import { NextRequest, NextResponse } from "next/server";
import { calculateRangePrice } from "@/lib/pricing";

// Public pricing API — returns dynamic price for date range
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const propertyId = url.searchParams.get("propertyId");
  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");

  if (!propertyId || !checkIn || !checkOut) {
    return NextResponse.json({ error: "propertyId, checkIn, checkOut required" }, { status: 400 });
  }

  const result = await calculateRangePrice(propertyId, checkIn, checkOut);
  return NextResponse.json(result);
}
