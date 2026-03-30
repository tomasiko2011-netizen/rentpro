import { db } from "@/lib/db";
import { blockedDates, channelListings, channels } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { parseICS } from "@/lib/ical";

interface SyncResult {
  added: number;
  updated: number;
  deleted: number;
  errors: string[];
}

/**
 * Sync a single iCal feed: fetch → parse → diff → update blockedDates
 */
export async function syncICalFeed(
  listingId: string,
  propertyId: string,
  feedUrl: string,
  platform: string
): Promise<SyncResult> {
  const result: SyncResult = { added: 0, updated: 0, deleted: 0, errors: [] };

  // 1. Fetch the iCal feed
  let icsText: string;
  try {
    const resp = await fetch(feedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "RentPro/1.0 iCal-Sync" },
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    icsText = await resp.text();
  } catch (e: any) {
    result.errors.push(`Fetch failed: ${e.message}`);
    await db.update(channelListings).set({
      syncStatus: "error",
      lastSync: new Date().toISOString(),
    }).where(eq(channelListings.id, listingId));
    return result;
  }

  // 2. Parse
  const events = parseICS(icsText);

  // 3. Load existing blocked dates for this property + platform
  const existing = await db
    .select()
    .from(blockedDates)
    .where(
      and(
        eq(blockedDates.propertyId, propertyId),
        eq(blockedDates.source, platform)
      )
    );

  const existingMap = new Map(existing.map(bd => [bd.externalUid, bd]));
  const seenUids = new Set<string>();

  // 4. Upsert events
  for (const event of events) {
    seenUids.add(event.uid);
    const existingBd = existingMap.get(event.uid);

    if (existingBd) {
      // Check if dates changed
      if (existingBd.dateFrom !== event.dateFrom || existingBd.dateTo !== event.dateTo) {
        await db.update(blockedDates).set({
          dateFrom: event.dateFrom,
          dateTo: event.dateTo,
          reason: event.summary,
        }).where(eq(blockedDates.id, existingBd.id));
        result.updated++;
      }
    } else {
      // New event
      await db.insert(blockedDates).values({
        propertyId,
        dateFrom: event.dateFrom,
        dateTo: event.dateTo,
        reason: event.summary,
        source: platform,
        externalUid: event.uid,
      });
      result.added++;
    }
  }

  // 5. Delete events that no longer exist in the feed
  for (const [uid, bd] of existingMap) {
    if (!seenUids.has(uid!)) {
      await db.delete(blockedDates).where(eq(blockedDates.id, bd.id));
      result.deleted++;
    }
  }

  // 6. Update listing status
  await db.update(channelListings).set({
    syncStatus: "synced",
    lastSync: new Date().toISOString(),
  }).where(eq(channelListings.id, listingId));

  return result;
}

/**
 * Sync all enabled feeds
 */
export async function syncAllFeeds(): Promise<{ total: number; results: Record<string, SyncResult> }> {
  const listings = await db
    .select({
      listingId: channelListings.id,
      propertyId: channelListings.propertyId,
      feedUrl: channelListings.externalId,
      platform: channels.platform,
      syncEnabled: channels.syncEnabled,
    })
    .from(channelListings)
    .innerJoin(channels, eq(channelListings.channelId, channels.id))
    .where(eq(channels.syncEnabled, true));

  const results: Record<string, SyncResult> = {};

  for (const listing of listings) {
    if (!listing.feedUrl) continue;
    results[listing.listingId] = await syncICalFeed(
      listing.listingId,
      listing.propertyId,
      listing.feedUrl,
      listing.platform
    );
  }

  return { total: listings.length, results };
}
