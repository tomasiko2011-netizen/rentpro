import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { channels, channelListings, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { syncICalFeed } from "@/lib/ical-sync";

// GET — list all iCal feeds for the user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const feeds = await db
    .select({
      listingId: channelListings.id,
      channelId: channelListings.channelId,
      propertyId: channelListings.propertyId,
      propertyName: properties.name,
      feedUrl: channelListings.externalId,
      syncStatus: channelListings.syncStatus,
      lastSync: channelListings.lastSync,
      platform: channels.platform,
      syncEnabled: channels.syncEnabled,
    })
    .from(channelListings)
    .innerJoin(channels, eq(channelListings.channelId, channels.id))
    .innerJoin(properties, eq(channelListings.propertyId, properties.id))
    .where(eq(channels.userId, userId));

  return NextResponse.json(feeds);
}

// POST — add a new iCal feed
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { propertyId, platform, feedUrl } = await req.json();

  if (!propertyId || !platform || !feedUrl) {
    return NextResponse.json({ error: "propertyId, platform, feedUrl required" }, { status: 400 });
  }

  if (!feedUrl.startsWith("https://")) {
    return NextResponse.json({ error: "URL must start with https://" }, { status: 400 });
  }

  // Verify property ownership
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
    .limit(1);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Find or create channel
  let [channel] = await db
    .select()
    .from(channels)
    .where(and(eq(channels.userId, userId), eq(channels.platform, platform)))
    .limit(1);

  if (!channel) {
    [channel] = await db.insert(channels).values({
      userId,
      platform,
      syncEnabled: true,
      status: "active",
    }).returning();
  }

  // Upsert listing
  const existing = await db
    .select()
    .from(channelListings)
    .where(
      and(
        eq(channelListings.channelId, channel.id),
        eq(channelListings.propertyId, propertyId)
      )
    )
    .limit(1);

  let listing;
  if (existing.length > 0) {
    await db.update(channelListings).set({
      externalId: feedUrl,
      syncStatus: "pending",
    }).where(eq(channelListings.id, existing[0].id));
    listing = { ...existing[0], externalId: feedUrl };
  } else {
    [listing] = await db.insert(channelListings).values({
      channelId: channel.id,
      propertyId,
      externalId: feedUrl,
      syncStatus: "pending",
    }).returning();
  }

  // Trigger immediate sync
  const syncResult = await syncICalFeed(listing.id, propertyId, feedUrl, platform);

  return NextResponse.json({ listing, syncResult }, { status: 201 });
}

// DELETE — remove a feed
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  // Get listing details before deleting
  const [listing] = await db
    .select({
      id: channelListings.id,
      propertyId: channelListings.propertyId,
      platform: channels.platform,
      userId: channels.userId,
    })
    .from(channelListings)
    .innerJoin(channels, eq(channelListings.channelId, channels.id))
    .where(eq(channelListings.id, listingId))
    .limit(1);

  if (!listing || listing.userId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete associated blocked dates
  const { blockedDates: bd } = await import("@/lib/db/schema");
  await db.delete(bd).where(
    and(
      eq(bd.propertyId, listing.propertyId),
      eq(bd.source, listing.platform)
    )
  );

  // Delete listing
  await db.delete(channelListings).where(eq(channelListings.id, listingId));

  return NextResponse.json({ ok: true });
}
