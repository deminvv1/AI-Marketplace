"use client";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { legalDocs, LEGAL_EMAIL, LEGAL_UPDATED, LEGAL_UPDATED_RU } from "@/content/legal";
import { routing } from "@/i18n/routing";


export default function TermsPage() {
  const t = useTranslations("legal");
  const tNav = useTranslations("footer");
  const locale = useLocale();
  const { docs, isFallback } = legalDocs(locale);
  const SECTIONS = docs.terms;
  const p = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <Header />

      {isFallback && (
        <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "12px 24px", textAlign: "center", fontSize: "0.88rem", color: "#92400e" }}>
          {t("englishOnly")}
        </div>
      )}

      <div style={{ paddingTop: 80, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 32px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: 8 }}>
            {t("termsTitle")}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{t("lastUpdated")}: {locale === "ru" ? LEGAL_UPDATED_RU : LEGAL_UPDATED}</p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {SECTIONS.map(({ title, body }) => (
            <div key={title}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: 12 }}>{title}</h2>
              <p style={{ fontSize: "0.93rem", color: "#374151", lineHeight: 1.75 }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, padding: "24px", borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: "0.88rem", color: "#6b7280" }}>
          <a href={`mailto:${LEGAL_EMAIL}`} style={{ color: "#6366f1", fontWeight: 600 }}>{LEGAL_EMAIL}</a>
          {" · "}
          <Link href={`${p}/privacy-policy`} style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>{t("privacyTitle")}</Link>
          {" · "}
          <Link href={`${p}/help`} style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>{tNav("helpCenter")}</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
