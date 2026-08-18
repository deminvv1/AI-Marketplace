"use client";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using AI Marketplace ("Platform", "we", "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. These Terms apply to all users — clients posting projects and specialists offering services.`,
  },
  {
    title: "2. Who Can Use the Platform",
    body: `You must be at least 18 years old to create an account. By registering, you confirm that all information you provide is accurate and that you have the legal capacity to enter into binding contracts. Accounts are personal and non-transferable.`,
  },
  {
    title: "3. Accounts and Registration",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use of your account. We reserve the right to suspend or terminate accounts that violate these Terms, provide false information, or engage in fraudulent activity.`,
  },
  {
    title: "4. Platform Fees",
    body: `Using AI Marketplace is free. We charge no commission on specialist earnings and take no service fee from either side. We do not process payments and we are not a payment intermediary: the client and the specialist agree the amount, the method and the schedule between themselves and settle directly. Project budgets shown on the Platform are stated in USD as a common reference only; the currency actually used is whatever the parties agree.`,
  },
  {
    title: "5. Role of the Platform",
    body: `AI Marketplace is a venue where clients and specialists find each other and communicate. We are not a party to any agreement between them, we do not hold, transfer or guarantee any funds, and we do not act as an agent, employer or escrow provider. Any contract for work is concluded directly between the client and the specialist, who are solely responsible for its terms, performance and payment. We recommend recording what has been agreed in the Platform chat before work begins.`,
  },
  {
    title: "6. Specialist Obligations",
    body: `Specialists agree to: (a) deliver work as described and agreed in project contracts; (b) maintain accurate profiles reflecting their genuine skills and experience; (c) communicate professionally and respond to clients in a timely manner; (d) not use client contact details obtained on the Platform for unsolicited advertising.

Because the Platform takes no commission and processes no payments, agreeing and settling directly with a client is expected, not a violation.`,
  },
  {
    title: "7. Client Obligations",
    body: `Clients agree to: (a) provide clear project briefs and respond to specialist questions promptly; (b) agree payment terms with the specialist before work begins and honour them; (c) review delivered work and give feedback within a reasonable period; (d) not request work that violates applicable law or third-party rights.`,
  },
  {
    title: "8. Intellectual Property",
    body: `Unless the parties agree otherwise in writing, ownership of deliverables produced specifically for a project passes to the client once the client has paid the specialist in full. Specialists retain ownership of pre-existing tools, frameworks and libraries incorporated into deliverables, but grant the client a perpetual licence to use them as part of the deliverable. Because the Platform is not involved in settlement, questions of payment and ownership are matters between the parties.`,
  },
  {
    title: "9. Prohibited Conduct",
    body: `Users must not: (a) post false, misleading or fraudulent content; (b) impersonate another person or misrepresent their skills or experience; (c) harass, threaten or discriminate against other users; (d) upload malware or engage in any activity that disrupts the Platform; (e) violate any applicable law or regulation.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `To the maximum extent permitted by law, AI Marketplace shall not be liable for indirect, incidental, special or consequential damages arising from use of the Platform. Because we are not a party to agreements between users and take no part in settlement, we are not liable for non-payment, for the quality or timeliness of delivered work, or for any loss arising from a transaction between users. Using the Platform is free, so our total liability for any claim is limited to the amount you have paid us, which is normally nil.`,
  },
  {
    title: "11. Disagreements Between Users",
    body: `Disagreements about work or payment are settled between the client and the specialist. We do not adjudicate them and cannot return, withhold or transfer money, because settlement does not pass through us. What we can do is act on reports: any profile, project or message may be reported to us, and we review every report and may restrict or block an account. Disputes between a user and AI Marketplace itself are governed by section 14.`,
  },
  {
    title: "12. Termination",
    body: `You may close your account at any time. Closing an account does not affect obligations you have already taken on towards another user; those remain a matter between you and them. We may suspend or close an account immediately if we detect fraud, illegal activity or serious violations of these Terms.`,
  },
  {
    title: "13. Changes to Terms",
    body: `We may update these Terms from time to time. We will notify users of material changes via email or in-platform notice at least 14 days before they take effect. Continued use of the Platform after changes take effect constitutes acceptance.`,
  },
  {
    title: "14. Governing Law",
    body: `These Terms are governed by applicable international commercial law. For users in the European Union, mandatory consumer protections under EU law apply and are not limited by these Terms.`,
  },
  {
    title: "15. Contact",
    body: `For questions about these Terms, contact us at: legal@aimarketplace.io`,
  },
];

export default function TermsPage() {
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
            {t("termsTitle")}
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
          Questions about these Terms?{" "}
          <a href="mailto:legal@aimarketplace.io" style={{ color: "#6366f1", fontWeight: 600 }}>legal@aimarketplace.io</a>
          {" · "}
          <Link href="/privacy-policy" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>
          {" · "}
          <Link href="/help" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>Help Center</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
