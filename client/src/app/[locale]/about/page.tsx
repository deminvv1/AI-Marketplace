"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Users, Globe, Zap, ShieldCheck, TrendingUp, Mail,
  FileText, MessagesSquare, CheckCircle2, Lock, BadgeCheck, Star, Flag,
} from "lucide-react";

const STAT_VALUES = ["2024", "12,400+", "128", "0%"];
const VALUE_ICONS = [TrendingUp, ShieldCheck, Globe, Zap];
const VALUE_KEYS = ["v1", "v2", "v3", "v4"] as const;

const HOW_ICONS = [FileText, MessagesSquare, Users, CheckCircle2];
const HOW_KEYS = ["how1", "how2", "how3", "how4"] as const;

const TRUST_ICONS = [Lock, BadgeCheck, Star, Flag];
const TRUST_KEYS = ["trust1", "trust2", "trust3", "trust4"] as const;

// Offset anchor targets so the fixed header doesn't cover section headings.
const ANCHOR_OFFSET = { scrollMarginTop: 84 } as const;

const TEAM = [
  { name: "Alex M.", role: "CEO & Co-founder", bio: "Former ML engineer. Built AI products at two unicorns before founding AI Marketplace." },
  { name: "Marina K.", role: "CTO & Co-founder", bio: "10 years building distributed systems. Previously led engineering at a top-5 European fintech." },
  { name: "Daniel R.", role: "Head of Product", bio: "Ex-Upwork product manager. Spent 4 years understanding exactly what freelancing platforms get wrong." },
];

const STAT_KEYS = ["statFounded", "statSpecialists", "statCountries", "statCommission"] as const;

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;
  const isRtl = locale === "ar";

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "120px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
            {t("heroTitle")}
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            {t("heroDesc")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2rem 5rem" }}>
          {STAT_KEYS.map((key, i) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, color: "#4338ca", letterSpacing: "-0.03em" }}>{STAT_VALUES[i]}</div>
              <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 4 }}>{t(key)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 24 }}>
            {t("missionTitle")}
          </h2>
          <p style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.75 }}>
            {t("missionText")}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ padding: "72px 24px", background: "#f9fafb", ...ANCHOR_OFFSET }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {t("howTitle")}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: 32 }}>{t("howDesc")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 24 }}>
            {HOW_KEYS.map((key, i) => {
              const Icon = HOW_ICONS[i];
              return (
                <div key={key} style={{ padding: 28, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={17} style={{ color: "#6366f1" }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.08em" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{t(`${key}Title`)}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.65 }}>{t(`${key}Desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 24 }}>
            {VALUE_KEYS.map((key, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <div key={key} style={{ padding: 28, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Icon size={20} style={{ color: "#6366f1" }} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{t(`${key}Title`)}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.65 }}>{t(`${key}Desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Trust */}
      <section id="trust" style={{ padding: "72px 24px", background: "#f9fafb", ...ANCHOR_OFFSET }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {t("trustTitle")}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: 32 }}>{t("trustDesc")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 24 }}>
            {TRUST_KEYS.map((key, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <div key={key} style={{ padding: 28, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Icon size={20} style={{ color: "#059669" }} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{t(`${key}Title`)}</h3>
                  <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.65 }}>{t(`${key}Desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "72px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 24 }}>
            {TEAM.map(member => (
              <div key={member.name} style={{ padding: 28, borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                  {member.name[0]}
                </div>
                <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{member.name}</div>
                <div style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 600, marginBottom: 10 }}>{member.role}</div>
                <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.6 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "72px 24px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <a
            href="mailto:hello@aimarketplace.io"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#6366f1", color: "#fff", borderRadius: 30, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}
          >
            <Mail size={16} /> hello@aimarketplace.io
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 24px 72px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 16, padding: "56px 40px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>
            {t("ctaTitle")}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "0.95rem", marginBottom: 28 }}>
            {t("ctaDesc")}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`${p}/browse`} style={{ padding: "12px 28px", background: "#fff", color: "#4338ca", borderRadius: 30, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              {t("ctaHire")}
            </Link>
            <Link href="/register" style={{ padding: "12px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 30, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
              {t("ctaWork")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
