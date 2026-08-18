"use client";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const SECTIONS = [
  {
    title: "1. Who We Are",
    body: `AI Marketplace International Ltd ("AI Marketplace", "we", "us", "our") operates the platform at aimarketplace.io. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our services.`,
  },
  {
    title: "2. What Data We Collect",
    body: `We collect: (a) Account data — name, email address, profile photo, country, and role (client or specialist); (b) Profile data — skills, work history, portfolio, and bio that you voluntarily provide; (c) Project data — project briefs, proposals, budgets stated by users, and project status; (d) Communication data — messages exchanged between users on the Platform; (e) Technical data — IP address, browser type, device identifiers, and usage logs collected automatically; (f) Verification data — identity documents submitted for account verification (where applicable).`,
  },
  {
    title: "3. How We Use Your Data",
    body: `We use your data to: (a) Create and maintain your account; (b) Match clients with suitable specialists; (c) Operate the Platform: publish projects and proposals, and deliver messages between users; (d) Send service emails (project updates, new proposals, security alerts); (e) Improve Platform features through aggregated, anonymised analytics; (f) Comply with legal obligations and prevent fraud; (g) Send optional marketing communications (only with your explicit consent, which you can withdraw at any time).`,
  },
  {
    title: "4. Legal Basis for Processing (GDPR)",
    body: `For users in the European Economic Area, we process your data on the following legal bases: (a) Contract performance — to deliver our services; (b) Legitimate interests — to improve the Platform, prevent fraud, and ensure security; (c) Legal obligation — to comply with applicable law; (d) Consent — for marketing communications and optional features. You have the right to withdraw consent at any time without affecting prior processing.`,
  },
  {
    title: "5. Data Sharing",
    body: `We do not sell your personal data. We share data only with: (a) Other users — your public profile is visible to all Platform users; messages are visible only to the conversation participants; (b) Email delivery providers — to send the service emails described above; (c) Cloud infrastructure providers — to host and operate the Platform; (d) Law enforcement — when required by law or to protect the rights and safety of users. All third-party processors are bound by data processing agreements.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your data for as long as your account is active. After account deletion, we retain minimal data required for legal compliance (transaction records, legal disputes) for up to 7 years. You may request deletion of other data at any time — see Section 9.`,
  },
  {
    title: "7. Cookies",
    body: `We use essential cookies required for the Platform to function (authentication sessions, security tokens). We use analytics cookies only with your consent. You can manage cookie preferences in your browser settings or via our cookie banner. We do not use third-party advertising cookies.`,
  },
  {
    title: "8. Security",
    body: `We implement industry-standard security measures including: encrypted data transmission (TLS), hashed password storage, access controls limiting who can view sensitive data, and regular security audits. No system is perfectly secure — if you suspect a breach, contact us immediately at security@aimarketplace.io.`,
  },
  {
    title: "9. Your Rights",
    body: `You have the right to: (a) Access — request a copy of all personal data we hold about you; (b) Correction — update inaccurate or incomplete data; (c) Deletion — request erasure of your data (subject to legal retention requirements); (d) Portability — receive your data in a machine-readable format; (e) Objection — object to processing based on legitimate interests; (f) Restriction — request that we limit processing while a dispute is resolved. To exercise any of these rights, email: privacy@aimarketplace.io. We respond within 30 days.`,
  },
  {
    title: "10. International Transfers",
    body: `Your data may be processed in countries outside your own. Where data is transferred outside the EEA, we ensure appropriate safeguards are in place (Standard Contractual Clauses or equivalent mechanisms) in accordance with applicable data protection law.`,
  },
  {
    title: "11. Children's Privacy",
    body: `Our Platform is not directed at children under 18. We do not knowingly collect personal data from minors. If you believe a minor has created an account, contact us at privacy@aimarketplace.io and we will delete the account promptly.`,
  },
  {
    title: "12. Changes to This Policy",
    body: `We may update this Privacy Policy. We will notify you of material changes by email or in-platform notice at least 14 days before they take effect. The date of the latest update is shown at the top of this page.`,
  },
  {
    title: "13. Contact & Complaints",
    body: `For privacy questions or to exercise your rights: privacy@aimarketplace.io. If you are in the EU and believe we have violated your rights, you have the right to lodge a complaint with your local data protection authority.`,
  },
];

export default function PrivacyPolicyPage() {
  const t = useTranslations("legal");
  const locale = useLocale();

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <Header />

      {locale !== "en" && (
        <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "12px 24px", textAlign: "center", fontSize: "0.88rem", color: "#92400e" }}>
          {t("englishOnly")}
        </div>
      )}

      <div style={{ paddingTop: 80, background: "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 32px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", marginBottom: 8 }}>
            {t("privacyTitle")}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{t("lastUpdated")}: 1 August 2026</p>
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
          Questions about your privacy?{" "}
          <a href="mailto:privacy@aimarketplace.io" style={{ color: "#6366f1", fontWeight: 600 }}>privacy@aimarketplace.io</a>
          {" · "}
          <Link href="/terms" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Terms of Service</Link>
          {" · "}
          <Link href="/help" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Help Center</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
