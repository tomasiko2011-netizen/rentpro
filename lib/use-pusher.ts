"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient, EVENTS } from "@/lib/pusher";

export function usePusherRefresh(onRefresh: () => void) {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (!userId || !process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY === "placeholder") return;

    const client = getPusherClient();
    const channel = client.subscribe(`user-${userId}`);

    const handler = () => onRefresh();
    channel.bind(EVENTS.BOOKING_CREATED, handler);
    channel.bind(EVENTS.BOOKING_UPDATED, handler);
    channel.bind(EVENTS.BOOKING_DELETED, handler);
    channel.bind(EVENTS.PROPERTY_UPDATED, handler);

    return () => {
      channel.unbind(EVENTS.BOOKING_CREATED, handler);
      channel.unbind(EVENTS.BOOKING_UPDATED, handler);
      channel.unbind(EVENTS.BOOKING_DELETED, handler);
      channel.unbind(EVENTS.PROPERTY_UPDATED, handler);
      client.unsubscribe(`user-${userId}`);
    };
  }, [userId, onRefresh]);
}
