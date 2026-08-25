"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { FaqSchema } from "@/components/seo/structured-data";
import { ChevronDown, Mail, MessageCircle, FileText } from "lucide-react";

/** Category key → the question/answer key pairs it holds. */
const FAQ_GROUPS: { cat: string; items: number[] }[] = [
  { cat: "cat1", items: [1, 2, 3, 4] },
  { cat: "cat2", items: [5, 6, 7, 8] },
  { cat: "cat3", items: [9, 10, 11, 12] },
  { cat: "cat4", items: [13, 14, 15, 16] },
  { cat: "cat5", items: [17, 18, 19] },
];

function FAQItem({ q, a, isRtl }: { q: string; a: string; isRtl: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e5e7eb" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 0", background: "none", border: "none", cursor: "pointer",
          textAlign: isRtl ? "right" : "left", gap: 16, font: "inherit",
        }}
      >
        <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>{q}</span>
        <ChevronDown size={16} style={{ color: "#9ca3af", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.75, paddingBottom: 18, [isRtl ? "paddingLeft" : "paddingRight"]: 24 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpPage() {
  const t = useTranslations("help");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const CONTACT_CARDS = [
    { icon: Mail,          title: t("cardEmailTitle"), desc: "hello@aiservicemarket.com", href: "mailto:hello@aiservicemarket.com" },
    { icon: MessageCircle, title: t("cardChatTitle"),  desc: t("cardChatDesc"),        href: "/messages" },
    { icon: FileText,      title: t("cardLegalTitle"), desc: "legal@aiservicemarket.com", href: "mailto:legal@aiservicemarket.com" },
  ];

  return (
    <>
      {/* Все 19 вопросов уходят в разметку — Google и Яндекс раскрывают их
          прямо в выдаче. Тексты те же, что на странице: расхождение считается
          обманом поисковика. */}
      <FaqSchema
        items={FAQ_GROUPS.flatMap(({ items }) =>
          items.map((n) => ({ question: t(`q${n}`), answer: t(`a${n}`) })),
        )}
      />
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "140px 24px 64px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 12 }}>
          {t("heroTitle")}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "1rem", maxWidth: 520, margin: "0 auto" }}>
          {t("heroDesc")}
        </p>
      </div>

      {/* Contact cards */}
      <div style={{ background: "#fafafa", borderBottom: "1px solid #e5e7eb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {CONTACT_CARDS.map(({ icon: Icon, title, desc, href }) => (
            <a key={title} href={href} style={{ flex: "1 1 220px", maxWidth: 260, padding: "20px 24px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", textDecoration: "none", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} style={{ color: "#6366f1" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.9rem", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>{desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>
        {FAQ_GROUPS.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6366f1", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t(cat)}
            </h2>
            <div>
              {items.map((n) => (
                <FAQItem key={n} q={t(`q${n}`)} a={t(`a${n}`)} isRtl={isRtl} />
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 32, padding: 28, borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <p style={{ fontSize: "0.95rem", color: "#374151", fontWeight: 600, marginBottom: 8 }}>{t("stillTitle")}</p>
          <p style={{ fontSize: "0.88rem", color: "#6b7280", marginBottom: 20 }}>{t("stillDesc")}</p>
          <a href="mailto:hello@aiservicemarket.com" style={{ display: "inline-block", padding: "10px 24px", background: "#6366f1", color: "#fff", borderRadius: 30, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            {t("stillCta")}
          </a>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
