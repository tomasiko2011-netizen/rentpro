import { NextRequest, NextResponse } from "next/server";
import { syncAllFeeds } from "@/lib/ical-sync";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllFeeds();

  return NextResponse.json({
    ok: true,
    synced: result.total,
    results: result.results,
    timestamp: new Date().toISOString(),
  });
}
