"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { useConsent } from "./consent-context";

/**
 * The consent bar and its settings panel.
 *
 * "Accept all" and "Reject all" are given identical visual weight on purpose:
 * refusing must be exactly as easy as agreeing, and the analytics switch starts
 * off rather than pre-ticked.
 */
export function CookieBanner() {
  const t = useTranslations("consent");
  const locale = useLocale();
  const { consent, panelOpen, decide, openPanel, closePanel } = useConsent();
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);

  const undecided = consent === null;
  if (!undecided && !panelOpen) return null;

  const p = locale === routing.defaultLocale ? "" : `/${locale}`;
  const showPanel = panelOpen;

  return (
    <>
      <style>{`
        .cc-shell {
          position: fixed; inset: auto 0 0 0; z-index: 60;
          background: #fff; border-top: 1px solid #e5e7eb;
          box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.12);
          font-family: system-ui, -apple-system, Arial, sans-serif;
        }
        .cc-inner { max-width: 1100px; margin: 0 auto; padding: 22px 24px; }
        .cc-row { display: flex; gap: 24px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; }
        .cc-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .cc-btn {
          padding: 10px 20px; border-radius: 8px; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; white-space: nowrap;
        }
        .cc-btn:focus-visible { outline: 2px solid #4338ca; outline-offset: 2px; }
        .cc-primary { background: #6366f1; color: #fff; }
        .cc-primary:hover { background: #4f46e5; }
        /* Same size and prominence as "accept": refusing must be equally easy. */
        .cc-secondary { background: #fff; color: #374151; border-color: #d1d5db; }
        .cc-secondary:hover { background: #f9fafb; }
        .cc-link { background: none; border: none; color: #4338ca; font-size: 0.85rem; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 10px 4px; }
        .cc-cat { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; gap: 16px; justify-content: space-between; align-items: flex-start; }
        .cc-switch { flex: 0 0 auto; }
        @media (max-width: 700px) {
          .cc-actions { width: 100%; }
          .cc-actions .cc-btn { flex: 1 1 auto; text-align: center; }
        }
      `}</style>

      <div
        className="cc-shell"
        role="dialog"
        aria-modal="false"
        aria-label={t("title")}
      >
        <div className="cc-inner">
          <div className="cc-row">
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                {t("title")}
              </div>
              <p style={{ fontSize: "0.88rem", color: "#4b5563", lineHeight: 1.65, margin: 0 }}>
                {t("text")}{" "}
                <Link href={`${p}/privacy-policy`} style={{ color: "#4338ca", fontWeight: 600 }}>
                  {t("more")}
                </Link>
              </p>
            </div>

            {!showPanel && (
              <div className="cc-actions">
                <button className="cc-btn cc-secondary" onClick={() => decide(false)}>
                  {t("rejectAll")}
                </button>
                <button className="cc-btn cc-primary" onClick={() => decide(true)}>
                  {t("acceptAll")}
                </button>
                <button className="cc-link" onClick={openPanel}>
                  {t("customise")}
                </button>
              </div>
            )}
          </div>

          {showPanel && (
            <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
              <div className="cc-cat">
                <div>
                  <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem" }}>
                    {t("necessaryTitle")}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "#6b7280", lineHeight: 1.6, marginTop: 4 }}>
                    {t("necessaryText")}
                  </div>
                </div>
                <span
                  className="cc-switch"
                  style={{ fontSize: "0.78rem", fontWeight: 600, color: "#059669", whiteSpace: "nowrap" }}
                >
                  {t("alwaysOn")}
                </span>
              </div>

              <label className="cc-cat" style={{ cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem" }}>
                    {t("analyticsTitle")}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "#6b7280", lineHeight: 1.6, marginTop: 4 }}>
                    {t("analyticsText")}
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="cc-switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: "#6366f1", cursor: "pointer" }}
                />
              </label>

              <div className="cc-actions" style={{ justifyContent: "flex-end" }}>
                {!undecided && (
                  <button className="cc-btn cc-secondary" onClick={closePanel}>
                    {t("close")}
                  </button>
                )}
                <button className="cc-btn cc-primary" onClick={() => decide(analytics)}>
                  {t("save")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/** Footer entry point — withdrawing consent must be as easy as giving it. */
export function CookieSettingsLink({ className }: { className?: string }) {
  const t = useTranslations("consent");
  const { openPanel } = useConsent();
  return (
    <button
      className={className}
      onClick={openPanel}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
    >
      {t("settings")}
    </button>
  );
}
