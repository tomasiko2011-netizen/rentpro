import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

// Client-side Pusher (lazy init)
let pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherClient) {
    pusherClient = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2" }
    );
  }
  return pusherClient;
}

// Event types
export const EVENTS = {
  BOOKING_CREATED: "booking:created",
  BOOKING_UPDATED: "booking:updated",
  BOOKING_DELETED: "booking:deleted",
  PROPERTY_UPDATED: "property:updated",
  NOTIFICATION: "notification",
} as const;
