"use client";

import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Download, Mail } from "lucide-react";

export default function PressPage() {
  const t = useTranslations("press");
  const tStats = useTranslations("stats");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const STATS: { value: string; label: string }[] = [
    { value: "0%", label: tStats("commissionLabel") },
    { value: "12", label: tStats("languagesLabel") },
    { value: "26", label: tStats("categoriesLabel") },
  ];

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

      {/* Key figures */}
      <section style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb", padding: "36px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2rem 5rem" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 800, color: "#4338ca", letterSpacing: "-0.03em" }}>{value}</div>
              <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Press kit + media contact */}
      <section style={{ padding: "72px 24px 88px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24 }}>
          {([
            { icon: Download, title: t("kitTitle"),     desc: t("kitDesc"),     cta: t("kitCta"),     mail: "press@aimarketplace.io?subject=Press%20kit%20request" },
            { icon: Mail,     title: t("contactTitle"), desc: t("contactDesc"), cta: t("contactCta"), mail: "press@aimarketplace.io" },
          ]).map(({ icon: Icon, title, desc, cta, mail }) => (
            <div key={title} style={{ padding: 32, borderRadius: 16, border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon size={20} style={{ color: "#6366f1" }} />
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: 10 }}>{title}</h2>
              <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.7, marginBottom: 24, flex: 1 }}>{desc}</p>
              <a
                href={`mailto:${mail}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", border: "1px solid #6366f1", color: "#4338ca", borderRadius: 30, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", alignSelf: "flex-start" }}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
