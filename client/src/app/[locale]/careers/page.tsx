"use client";

import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Code2, Palette, ShieldCheck, ArrowRight } from "lucide-react";

const ROLE_KEYS = ["r1", "r2", "r3"] as const;
const ROLE_ICONS = [Code2, Palette, ShieldCheck];

export default function CareersPage() {
  const t = useTranslations("careers");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "120px 24px 72px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,2.9rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 18 }}>
            {t("title")}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, maxWidth: 620 }}>
            {t("lead")}
          </p>
        </div>
      </section>

      {/* Open roles */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "0.74rem", fontWeight: 700, color: "#6b7280", letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: 24 }}>
            {t("rolesTitle")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ROLE_KEYS.map((key, i) => {
              const Icon = ROLE_ICONS[i];
              return (
                <a
                  key={key}
                  href={`mailto:careers@aimarketplace.io?subject=${encodeURIComponent(t(key))}`}
                  className="career-card"
                  style={{
                    display: "flex", alignItems: "center", gap: 18,
                    padding: "22px 26px", borderRadius: 14,
                    border: "1px solid #e5e7eb", background: "#fafafa",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={19} style={{ color: "#6366f1" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 3 }}>{t(key)}</div>
                    <div style={{ fontSize: "0.83rem", color: "#6b7280" }}>{t("remote")}</div>
                  </div>
                  <ArrowRight size={17} style={{ color: "#9ca3af", flexShrink: 0, transform: isRtl ? "rotate(180deg)" : "none" }} />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to apply */}
      <section style={{ padding: "0 24px 88px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 32px", borderRadius: 16, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: 12 }}>{t("applyTitle")}</h2>
          <p style={{ fontSize: "0.95rem", color: "#374151", lineHeight: 1.75, marginBottom: 22 }}>{t("applyDesc")}</p>
          <a
            href="mailto:careers@aimarketplace.io"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", background: "#6366f1", color: "#fff", borderRadius: 30, fontWeight: 600, fontSize: "0.92rem", textDecoration: "none" }}
          >
            {t("applyCta")}
          </a>
        </div>
      </section>

      <style>{`
        .career-card { transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease; }
        .career-card:hover { border-color: #c7d2fe; background: #fff; transform: translateY(-1px); }
        .career-card:focus-visible { outline: 2px solid #6366f1; outline-offset: 3px; }
      `}</style>

      <Footer />
    </div>
  );
}
