"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_DAYS,
  consentCookieValue,
  makeConsent,
  type Consent,
} from "@/lib/consent";

type ConsentState = {
  /** null = the visitor has not answered yet, so the banner is shown. */
  consent: Consent | null;
  /** Whether the settings panel is open (also reachable from the footer). */
  panelOpen: boolean;
  decide: (analytics: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
};

const Ctx = createContext<ConsentState | null>(null);

export function useConsent(): ConsentState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}

export function ConsentProvider({
  initial,
  children,
}: {
  /** Read from the cookie on the server, so the banner never flashes. */
  initial: Consent | null;
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<Consent | null>(initial);
  const [panelOpen, setPanelOpen] = useState(false);

  const decide = useCallback((analytics: boolean) => {
    const next = makeConsent(analytics);
    document.cookie = [
      `${CONSENT_COOKIE}=${consentCookieValue(next)}`,
      "path=/",
      `max-age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}`,
      "SameSite=Lax",
      ...(location.protocol === "https:" ? ["Secure"] : []),
    ].join("; ");
    setConsent(next);
    setPanelOpen(false);
    // Withdrawing consent must actually stop the tracking that is already
    // running, and scripts cannot be unloaded — so reload once.
    if (!analytics && typeof window !== "undefined" && window.__analyticsLoaded) {
      window.location.reload();
    }
  }, []);

  const value = useMemo(
    () => ({
      consent,
      panelOpen,
      decide,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
    }),
    [consent, panelOpen, decide],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

declare global {
  interface Window {
    __analyticsLoaded?: boolean;
  }
}
