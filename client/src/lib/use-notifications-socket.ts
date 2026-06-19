"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { NotificationItem } from "@/app/actions/notifications";

interface Options {
  onNotification: (n: NotificationItem) => void;
}

// Subscribes to real-time notification events on the global socket.
// The socket is created once in AppShell and stays alive across navigations.
export function useNotificationsSocket({ onNotification }: Options) {
  useEffect(() => {
    let active = true;

    // Poll until the singleton socket is ready (AppShell creates it async).
    const tid = setInterval(() => {
      const sock = getSocket();
      if (!sock) return;

      clearInterval(tid);

      const handler = (notif: NotificationItem) => {
        if (active) onNotification(notif);
      };

      sock.on("notification", handler);

      return () => {
        sock.off("notification", handler);
      };
    }, 300);

    return () => {
      active = false;
      clearInterval(tid);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
