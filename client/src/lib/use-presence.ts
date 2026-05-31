"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

const AWAY_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes in background → offline

export function usePresence() {
  useEffect(() => {
    let awayTimer: ReturnType<typeof setTimeout> | null = null;

    function goOnline() {
      if (awayTimer) { clearTimeout(awayTimer); awayTimer = null; }
      getSocket("")?.emit("go_online");
    }

    function scheduleOffline() {
      if (awayTimer) return;
      awayTimer = setTimeout(() => {
        getSocket("")?.emit("go_offline");
        awayTimer = null;
      }, AWAY_TIMEOUT_MS);
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        scheduleOffline();
      } else {
        goOnline();
      }
    }

    function handleBeforeUnload() {
      // Synchronous best-effort before tab closes
      getSocket("")?.emit("go_offline");
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (awayTimer) clearTimeout(awayTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}