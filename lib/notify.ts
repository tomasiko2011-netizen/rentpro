import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export async function createNotification(userId: string, type: string, title: string, body?: string) {
  await db.insert(notifications).values({ userId, type, title, body });
}
