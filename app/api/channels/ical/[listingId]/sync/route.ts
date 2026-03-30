import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { channelListings, channels } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { syncICalFeed } from "@/lib/ical-sync";

// POST — trigger manual sync for a specific feed
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await params;
  const userId = (session.user as { id: string }).id;

  const [listing] = await db
    .select({
      id: channelListings.id,
      propertyId: channelListings.propertyId,
      feedUrl: channelListings.externalId,
      platform: channels.platform,
      userId: channels.userId,
    })
    .from(channelListings)
    .innerJoin(channels, eq(channelListings.channelId, channels.id))
    .where(eq(channelListings.id, listingId))
    .limit(1);

  if (!listing || listing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!listing.feedUrl) {
    return NextResponse.json({ error: "No feed URL configured" }, { status: 400 });
  }

  const result = await syncICalFeed(listing.id, listing.propertyId, listing.feedUrl, listing.platform);

  return NextResponse.json(result);
}
