"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Search, Code2, Palette, TrendingUp, FileText, Briefcase,
  DollarSign, ChevronRight, Star, Film, Music, BarChart2,
  Brain, Factory,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/structured-data";
import GlobeGL from "@/components/globe/GlobeGL";

// ── Star canvas ───────────────────────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    ctx.fillStyle = "#020816";
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 550; i++) {
      const x = Math.random() * c.width;
      const y = Math.random() * c.height;
      const r = Math.random() * 1.3 + 0.2;
      const a = Math.random() * 0.75 + 0.25;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
      ctx.fill();
    }
    const grd = ctx.createLinearGradient(c.width * 0.1, c.height * 0.15, c.width * 0.9, c.height * 0.85);
    grd.addColorStop(0, "rgba(80,110,180,0)");
    grd.addColorStop(0.5, "rgba(80,110,180,0.05)");
    grd.addColorStop(1, "rgba(80,110,180,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;
  const [query, setQuery] = useState("");
  const chips = t.raw("chips") as string[];

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 620, overflow: "hidden", background: "#020816", fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" }}>
      <StarCanvas />
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}><GlobeGL /></div>
      <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "linear-gradient(to right, rgba(2,8,22,0.92) 0%, rgba(2,8,22,0.75) 30%, rgba(2,8,22,0.3) 60%, rgba(2,8,22,0.05) 85%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 2, background: "linear-gradient(to top, rgba(2,8,22,0.85) 0%, transparent 100%)" }} />

      <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px clamp(20px, 6vw, 80px) 0", maxWidth: 780 }}>
        <h1 style={{ fontSize: "clamp(2rem, 4.8vw, 3.8rem)", fontWeight: 700, color: "#ffffff", lineHeight: 1.15, marginBottom: "1.6rem", letterSpacing: "-0.02em" }}>
          {t("headline1")}<br />{t("headline2")}
        </h1>

        <div style={{ display: "flex", background: "#ffffff", borderRadius: 6, overflow: "hidden", maxWidth: 560, boxShadow: "0 6px 32px rgba(0,0,0,0.35)" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            style={{ flex: 1, border: "none", outline: "none", padding: "15px 18px", fontSize: "0.95rem", color: "#111827", background: "transparent" }}
          />
          <Link href={`${p}/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", padding: "0 22px", cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Search size={20} color="white" />
          </Link>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
          {chips.map((chip) => (
            <Link key={chip} href={`${p}/browse?q=${encodeURIComponent(chip)}`} style={{ padding: "0.4rem 1.05rem", borderRadius: 20, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.88)", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
              {chip}<ChevronRight size={12} style={{ opacity: 0.6 }} />
            </Link>
          ))}
        </div>

      </div>

      <div style={{ position: "absolute", bottom: 28, left: 28, zIndex: 20, background: "rgba(6,10,28,0.80)", backdropFilter: "blur(18px)", border: "1px solid rgba(100,135,255,0.2)", borderRadius: 14, padding: "0.55rem 1.1rem", display: "flex", alignItems: "center", gap: 10 }}>
        <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", boxShadow: "0 0 10px #a78bfa", display: "inline-block", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "0.03em" }}>2 684</div>
          <div style={{ fontSize: "0.58rem", color: "rgba(165,192,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("onlineLabel")}</div>
        </div>
      </div>
    </section>
  );
}

// ── Trusted logos strip ───────────────────────────────────────────────────────

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  const t = useTranslations("stats");
  // Только проверяемые числа: комиссия, языки, категории. Выдуманные
  // «12 400+ специалистов» и «4.9 рейтинг» убраны — в базе их нет.
  const STATS = [
    { value: t("commissionValue"), label: t("commissionLabel") },
    { value: t("languagesValue"),  label: t("languagesLabel") },
    { value: t("categoriesValue"), label: t("categoriesLabel") },
  ];
  return (
    <section style={{ padding: "64px 24px", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>{t("title")}</h2>
          <p style={{ fontSize: "1rem", color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{t("description")}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center", padding: "32px 40px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fafafa", flex: "1 1 160px", maxWidth: 240, minWidth: 160 }}>
              <div style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 800, color: "#4338ca", letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>{value}</div>
              <div style={{ fontSize: "0.88rem", color: "#6b7280", marginTop: "0.5rem", fontWeight: 500, whiteSpace: "nowrap" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
function CategoryCard({ slug, label, p }: { slug: string; label: string; p: string }) {
  const [hovered, setHovered] = useState(false);
  const ICONS: Record<string, React.ElementType> = {
    "ai-automation": Brain, "programming-tech": Code2, "data-science": BarChart2,
    "design-creative": Palette, "marketing-growth": TrendingUp, "writing-content": FileText,
    "video-animation": Film, "industry-solutions": Factory, "business-support": Briefcase, "music-audio": Music,
  };
  const Icon = ICONS[slug] ?? Brain;
  return (
    <Link href={`${p}/browse?category=${slug}`} style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0, padding: "24px 20px", borderRadius: 10, border: `1px solid ${hovered ? "rgba(99,102,241,0.4)" : "#e5e7eb"}`, background: hovered ? "rgba(99,102,241,0.04)" : "#fff", cursor: "pointer", textDecoration: "none", transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s", boxShadow: hovered ? "0 4px 24px rgba(99,102,241,0.14)" : "none" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: hovered ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}>
        <Icon size={22} style={{ color: hovered ? "#fff" : "#6366f1" }} strokeWidth={1.6} />
      </div>
      <span style={{ fontSize: "0.93rem", fontWeight: 600, color: hovered ? "#4338ca" : "#111827", lineHeight: 1.3 }}>{label}</span>
    </Link>
  );
}

function CategoriesSection() {
  const t = useTranslations("categories");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;
  const CATS = [
    { slug: "ai-automation",     key: "aiAutomation" },
    { slug: "programming-tech",  key: "programmingTech" },
    { slug: "data-science",      key: "dataScience" },
    { slug: "design-creative",   key: "designCreative" },
    { slug: "marketing-growth",  key: "marketingGrowth" },
    { slug: "writing-content",   key: "writingContent" },
    { slug: "video-animation",   key: "videoAnimation" },
    { slug: "industry-solutions",key: "industrySolutions" },
    { slug: "business-support",  key: "businessSupport" },
    { slug: "music-audio",       key: "musicAudio" },
  ] as const;
  return (
    <section style={{ padding: "72px 0", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", marginBottom: "2rem", letterSpacing: "-0.02em" }}>{t("title")}</h2>
        {/* auto-fill instead of a fixed 5 columns: long category names cannot shrink
            below their min-content width and used to push the page sideways on phones. */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 160px), 1fr))", gap: 16 }}>
          {CATS.map(({ slug, key }) => <CategoryCard key={slug} slug={slug} label={t(key)} p={p} />)}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const t = useTranslations("how");
  const [tab, setTab] = useState<"hiring" | "work">("hiring");

  const hiringSteps = [
    { title: t("h1Title"), desc: t("h1Desc") },
    { title: t("h2Title"), desc: t("h2Desc") },
    { title: t("h3Title"), desc: t("h3Desc") },
  ];
  const workSteps = [
    { title: t("w1Title"), desc: t("w1Desc") },
    { title: t("w2Title"), desc: t("w2Desc") },
    { title: t("w3Title"), desc: t("w3Desc") },
  ];
  const steps = tab === "hiring" ? hiringSteps : workSteps;

  return (
    <section style={{ padding: "72px 0", background: "#f9fafb", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{t("title")}</h2>
          <div style={{ display: "flex", border: "1px solid #e5e7eb", borderRadius: 30, overflow: "hidden", background: "#fff" }}>
            {(["hiring", "work"] as const).map((tab_) => (
              <button key={tab_} onClick={() => setTab(tab_)} style={{ padding: "0.5rem 1.4rem", fontSize: "0.85rem", fontWeight: tab === tab_ ? 600 : 400, color: tab === tab_ ? "#4338ca" : "#6b7280", background: tab === tab_ ? "#ede9fe" : "transparent", border: "none", cursor: "pointer", transition: "all 0.2s", borderRadius: 30 }}>
                {tab_ === "hiring" ? t("tabHiring") : t("tabWork")}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff" }}>
              <div style={{ height: 200, background: i === 0 ? "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)" : i === 1 ? "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)" : "linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i === 0 ? (
                  <span style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>aimarket.</span>
                ) : i === 1 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 24px" }}>
                    {[85, 92, 78].map((score, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 8, padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${idx * 40 + 240},65%,60%), hsl(${idx * 40 + 280},65%,60%))`, flexShrink: 0 }} />
                        <div><div style={{ height: 8, width: 90, background: "#e5e7eb", borderRadius: 4 }} /><div style={{ height: 6, width: 60, background: "#f3f4f6", borderRadius: 4, marginTop: 4 }} /></div>
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "#6366f1" }}>{score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>
                      <DollarSign size={28} style={{ color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 600 }}>Secure Payment</span>
                  </div>
                )}
              </div>
              <div style={{ padding: "20px 22px 24px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "#6b7280", lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection() {
  const t = useTranslations("cta");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;
  return (
    <section style={{ padding: "40px 24px", background: "#f9fafb", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div className="cta-inner-box" style={{ maxWidth: 1180, margin: "0 auto", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: 16, padding: "56px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>{t("headline")}</h2>
        <Link href={`${p}/browse`} style={{ display: "inline-block", padding: "0.75rem 2rem", background: "#fff", color: "#111827", borderRadius: 30, fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          {t("button")}
        </Link>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LocaleLandingPage() {
  const locale = useLocale();
  const tMeta = useTranslations("meta");

  return (
    <main>
      {/* Описание сайта для Google и Яндекса. Текст берём тот же, что в
          описании страницы, — расхождение поисковики считают обманом. */}
      <OrganizationSchema locale={locale} description={tMeta("description")} />
      <WebSiteSchema locale={locale} />
      <style>{`
        @media (max-width: 767px) {
          .cta-inner-box { padding: 40px 20px !important; border-radius: 12px !important; }
        }
      `}</style>
      <Header />
      <HeroSection />
      <StatsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
