"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Star, Zap, Globe, ShieldCheck, TrendingUp, DollarSign, Award, ChevronRight } from "lucide-react";

const DIFF_ICONS = [DollarSign, TrendingUp, Zap, Globe, ShieldCheck, Award];
const DIFF_KEYS = ["d1", "d2", "d3", "d4", "d5", "d6"] as const;
const DIFF_ACCENTS = ["#6366f1", "#8b5cf6", "#6366f1", "#8b5cf6", "#6366f1", "#8b5cf6"];

const STAT_VALUES = ["0%", "12,400+", "128", "+35%"];
const STAT_KEYS = ["statCommission", "statSpecialists", "statCountries", "statEarnings"] as const;

const TESTIMONIAL_KEYS = [
  { q: "t1Q", r: "t1R", name: "Arjun M.", country: "🇮🇳" },
  { q: "t2Q", r: "t2R", name: "Sarah K.", country: "🇩🇪" },
  { q: "t3Q", r: "t3R", name: "Lukas B.", country: "🇦🇹" },
] as const;

/**
 * Comparison rows. Cells are either a literal (numbers, emoji marks) or a
 * translation key prefixed with `@` so figures stay put while words translate.
 */
const COMPARE: { feature: string; cells: string[] }[] = [
  { feature: "f1", cells: ["0%", "10–20%", "20%", "~40%*", "10–20%", "20%"] },
  { feature: "f2", cells: ["✅ @vYes", "❌ @vGeneric", "❌ @vGeneric", "❌ @vGeneric", "❌ @vGeneric", "❌ @vGeneric"] },
  { feature: "f3", cells: ["↑ 25–40%", "@vBaseline", "@vBaseline", "@vHigh", "@vLowMid", "@vLow"] },
  { feature: "f4", cells: ["128+", "180+", "160+", "100+", "🇷🇺 @vRuCis", "🇷🇺 @vRuCis"] },
  // We are not a payment intermediary, so this row states the difference
  // plainly rather than claiming an escrow we do not run.
  { feature: "f5", cells: ["@vDirect", "@vThroughPlatform", "@vThroughPlatform", "@vThroughPlatform", "@vThroughPlatform", "@vThroughPlatform"] },
  { feature: "f6", cells: ["✅", "✅", "✅", "✅", "✅", "✅"] },
  { feature: "f7", cells: ["❌ @vNone", "✅ @vSeveral", "✅ @vSeveral", "✅ @vSeveral", "⚠️ @vBoosts", "⚠️ @vExtras"] },
  { feature: "f8", cells: ["✅", "✅", "✅", "❌ @vVettedOnly", "✅", "✅"] },
];

const COMPETITORS = ["Upwork", "Fiverr", "Toptal", "FL.ru", "Kwork"];

export default function WhyAIMarket() {
  const t = useTranslations("why");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const p = locale === "en" ? "" : `/${locale}`;

  /** Replaces every `@key` token in a cell with its translation. */
  const cell = (raw: string) =>
    raw.replace(/@(\w+)/g, (_, key) => t(key as never));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "120px 24px 72px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 14px", marginBottom: "1.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
            <Star size={12} style={{ fill: "#fcd34d", color: "#fcd34d" }} /> {t("badge")}
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "1.25rem", textWrap: "balance" }}>
            {t("heroTitle")}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.65, maxWidth: 560, margin: "0 auto 2rem" }}>
            {t("heroDesc")}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${p}/browse`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 28px", background: "#fff", color: "#4338ca", borderRadius: 30, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              {t("ctaFind")} <ChevronRight size={16} style={{ transform: isRtl ? "rotate(180deg)" : "none" }} />
            </Link>
            <Link href={`${p}/register`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 30, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
              {t("ctaJoin")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2rem 4rem" }}>
          {STAT_KEYS.map((key, i) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, color: "#4338ca", letterSpacing: "-0.03em" }}>{STAT_VALUES[i]}</div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>{t(key)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "#111827", marginBottom: "0.75rem", letterSpacing: "-0.02em", textAlign: "center", textWrap: "balance" }}>
            {t("diffTitle")}
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.95rem", maxWidth: 560, margin: "0 auto 3rem" }}>
            {t("diffSubtitle")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 24 }}>
            {DIFF_KEYS.map((key, i) => {
              const Icon = DIFF_ICONS[i];
              const accent = DIFF_ACCENTS[i];
              return (
                <div key={key} style={{ padding: 28, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Icon size={20} style={{ color: accent }} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{t(`${key}T`)}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.65 }}>{t(`${key}D`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: "72px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "#111827", marginBottom: "0.5rem", letterSpacing: "-0.02em", textAlign: "center" }}>
            {t("compareTitle")}
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.85rem", marginBottom: "2rem" }}>{t("compareNote")}</p>
          <div style={{ borderRadius: 12, overflowX: "auto", border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#4f46e5" }}>
                  <th style={{ padding: "14px 16px", textAlign: isRtl ? "right" : "left", color: "#fff", fontWeight: 600 }}>{t("colFeature")}</th>
                  <th style={{ padding: "14px 12px", textAlign: "center", color: "#fcd34d", fontWeight: 700 }}>AI Market</th>
                  {COMPETITORS.map((name) => (
                    <th key={name} style={{ padding: "14px 12px", textAlign: "center", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "12px 16px", color: "#374151", fontWeight: 500 }}>{t(row.feature as never)}</td>
                    {row.cells.map((raw, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          color: j === 0 ? "#4338ca" : "#6b7280",
                          fontWeight: j === 0 ? 700 : 400,
                        }}
                      >
                        {cell(raw)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 700, color: "#111827", marginBottom: "2.5rem", letterSpacing: "-0.02em", textAlign: "center" }}>
            {t("testiTitle")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 290px), 1fr))", gap: 20 }}>
            {TESTIMONIAL_KEYS.map(({ q, r, name, country }) => (
              <div key={name} style={{ padding: 28, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fafafa" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />)}
                </div>
                <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.65, fontStyle: "italic", marginBottom: 20 }}>
                  {`“${t(q)}”`}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.8rem", fontWeight: 700 }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111827" }}>{name} {country}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{t(r)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 24px 72px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 16, padding: "56px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.02em", textWrap: "balance" }}>
            {t("ctaTitle")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.95rem", marginBottom: "2rem" }}>
            {t("ctaDesc")}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${p}/browse`} style={{ padding: "12px 28px", background: "#fff", color: "#4338ca", borderRadius: 30, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              {t("ctaFind")}
            </Link>
            <Link href={`${p}/register`} style={{ padding: "12px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 30, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
              {t("ctaEarn")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
