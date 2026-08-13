"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search, Bot, Code2, Palette, TrendingUp, FileText, Briefcase,
  DollarSign, Scale, Users, Cpu, Facebook, Linkedin, Twitter,
  Youtube, Instagram, ChevronRight, Star,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import GlobeGL from "@/components/globe/GlobeGL";

// ── Star canvas ─────────────────────────────────────────────────────────────
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
    // Subtle Milky Way band
    const grd = ctx.createLinearGradient(c.width * 0.1, c.height * 0.15, c.width * 0.9, c.height * 0.85);
    grd.addColorStop(0,   "rgba(80,110,180,0)");
    grd.addColorStop(0.5, "rgba(80,110,180,0.05)");
    grd.addColorStop(1,   "rgba(80,110,180,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
const HERO_CHIPS = [
  "AI Development", "Data Science", "Web Design", "Video Editing", "Marketing",
];

function HeroSection() {
  const [query, setQuery] = useState("");
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 620,
        overflow: "hidden",
        background: "#020816",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Stars */}
      <StarCanvas />

      {/* Globe — fills hero */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <GlobeGL />
      </div>

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 2,
          background: "linear-gradient(to right, rgba(2,8,22,0.92) 0%, rgba(2,8,22,0.75) 30%, rgba(2,8,22,0.3) 60%, rgba(2,8,22,0.05) 85%)",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 2,
          background: "linear-gradient(to top, rgba(2,8,22,0.85) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative", zIndex: 10, height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px clamp(20px, 6vw, 80px) 0",
          maxWidth: 780,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 4.8vw, 3.8rem)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "1.6rem",
            letterSpacing: "-0.02em",
          }}
        >
          Find AI specialists<br />
          who deliver results
        </h1>

        {/* Search */}
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            borderRadius: 6,
            overflow: "hidden",
            maxWidth: 560,
            boxShadow: "0 6px 32px rgba(0,0,0,0.35)",
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for any service..."
            style={{
              flex: 1, border: "none", outline: "none",
              padding: "15px 18px", fontSize: "0.95rem",
              color: "#111827", background: "transparent",
            }}
          />
          <Link
            href={`/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            style={{
              background: "#14a800", border: "none",
              padding: "0 22px", cursor: "pointer",
              display: "flex", alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Search size={20} color="white" />
          </Link>
        </div>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
          {HERO_CHIPS.map((chip) => (
            <Link
              key={chip}
              href={`/browse?q=${encodeURIComponent(chip)}`}
              style={{
                padding: "0.4rem 1.05rem",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.88)",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3,
                textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              {chip}
              <ChevronRight size={12} style={{ opacity: 0.6 }} />
            </Link>
          ))}
        </div>

        {/* Trusted by */}
        <div
          style={{
            marginTop: "2.8rem",
            display: "flex", alignItems: "center", gap: "1.8rem", flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.45)", fontSize: "0.8rem",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}
          >
            Trusted by:
          </span>
          {["Airbnb", "Google", "Microsoft", "Meta", "Netflix"].map((name) => (
            <span
              key={name}
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.92rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Online specialists pill */}
      <div
        style={{
          position: "absolute", bottom: 28, left: 28, zIndex: 20,
          background: "rgba(6,10,28,0.80)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(100,135,255,0.2)",
          borderRadius: 14, padding: "0.55rem 1.1rem",
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span
          className="animate-pulse"
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#4ade80", boxShadow: "0 0 10px #4ade80",
            display: "inline-block", flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", letterSpacing: "0.03em" }}>
            2 684
          </div>
          <div style={{ fontSize: "0.58rem", color: "rgba(165,192,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Specialists Online
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Trusted logos strip ───────────────────────────────────────────────────────
const LOGOS = ["Airbnb", "Databricks", "Cloudflare", "Microsoft", "Grammarly", "BambooHR", "Shutterstock"];

function TrustedSection() {
  return (
    <div
      style={{
        background: "#fafafa",
        borderTop: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
        padding: "20px 0",
        fontFamily: "system-ui, -apple-system, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1180, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", gap: "2.5rem", flexWrap: "wrap", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          Trusted by 800,000+ clients
        </span>
        {LOGOS.map((l) => (
          <span key={l} style={{ fontSize: "0.95rem", fontWeight: 700, color: "#6b7280", letterSpacing: "-0.01em" }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATS = [
  { name: "AI Services",                icon: Bot,         slug: "ai-services" },
  { name: "Development & IT",           icon: Code2,       slug: "development-it" },
  { name: "Design & Creative",          icon: Palette,     slug: "design-creative" },
  { name: "Sales & Marketing",          icon: TrendingUp,  slug: "marketing" },
  { name: "Writing & Translation",      icon: FileText,    slug: "writing" },
  { name: "Admin & Support",            icon: Briefcase,   slug: "admin-support" },
  { name: "Finance & Accounting",       icon: DollarSign,  slug: "finance" },
  { name: "Legal",                      icon: Scale,       slug: "legal" },
  { name: "HR & Training",              icon: Users,       slug: "hr-training" },
  { name: "Engineering & Architecture", icon: Cpu,         slug: "engineering" },
];

function CategoryCard({ cat }: { cat: typeof CATS[0] }) {
  const [hovered, setHovered] = useState(false);
  const Icon = cat.icon;
  return (
    <Link
      href={`/browse?category=${cat.slug}`}
      style={{
        display: "flex", flexDirection: "column", gap: 14,
        padding: "24px 20px",
        borderRadius: 8,
        border: `1px solid ${hovered ? "#d1d5db" : "#e5e7eb"}`,
        background: hovered ? "#fafff9" : "#fff",
        cursor: "pointer",
        textDecoration: "none",
        transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.07)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={32} style={{ color: "#14a800" }} strokeWidth={1.5} />
      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
        {cat.name}
      </span>
    </Link>
  );
}

function CategoriesSection() {
  return (
    <section style={{ padding: "72px 0", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", marginBottom: "2rem", letterSpacing: "-0.02em" }}>
          Find specialists for every type of work
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {CATS.map((cat) => <CategoryCard key={cat.name} cat={cat} />)}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
const HOW_TABS = {
  hiring: [
    {
      title: "Post your project",
      desc: "Tell us what you need and your budget. Get matched with top-rated specialists in minutes.",
      bg: "linear-gradient(135deg, #d4f0c0 0%, #b5e8a0 100%)",
    },
    {
      title: "Review proposals",
      desc: "Compare profiles, portfolios, and hourly rates from vetted specialists. Chat before you hire.",
      img: true,
    },
    {
      title: "Pay when work is done",
      desc: "Pay only for work you approve. Our escrow protects every milestone from start to finish.",
      img: true,
    },
  ],
  work: [
    {
      title: "Create your profile",
      desc: "Showcase your skills, portfolio, and hourly rate. Get discovered by clients worldwide.",
      bg: "linear-gradient(135deg, #c5e4ff 0%, #a0cfff 100%)",
    },
    {
      title: "Browse and apply",
      desc: "Find projects that match your expertise. Write a proposal and stand out from the crowd.",
      img: true,
    },
    {
      title: "Get paid securely",
      desc: "Work tracked, hours logged, money secured. Get paid via your preferred method globally.",
      img: true,
    },
  ],
};

function HowItWorksSection() {
  const [tab, setTab] = useState<"hiring" | "work">("hiring");
  const steps = HOW_TABS[tab];
  return (
    <section style={{ padding: "72px 0", background: "#f9fafb", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
            How it works
          </h2>
          <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 30, overflow: "hidden" }}>
            {(["hiring", "work"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "0.5rem 1.4rem",
                  fontSize: "0.85rem",
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? "#111827" : "#6b7280",
                  background: tab === t ? "#fff" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderRadius: 30,
                }}
              >
                {t === "hiring" ? "For hiring" : "For finding work"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                borderRadius: 12, overflow: "hidden",
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <div
                style={{
                  height: 200,
                  background: step.bg || (i === 1
                    ? "linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)"
                    : "linear-gradient(135deg, #fdf0ff 0%, #f3e8ff 100%)"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {i === 0 ? (
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#14a800", fontFamily: "Arial, sans-serif" }}>
                    aimarket.
                  </span>
                ) : i === 1 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 24px" }}>
                    {[85, 92, 78].map((score, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 8, padding: "8px 14px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${idx * 40 + 140},50%,55%)`, flexShrink: 0 }} />
                        <div>
                          <div style={{ height: 8, width: 90, background: "#e5e7eb", borderRadius: 4 }} />
                          <div style={{ height: 6, width: 60, background: "#f3f4f6", borderRadius: 4, marginTop: 4 }} />
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "#14a800" }}>{score}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e9d5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={28} style={{ color: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "#7c3aed", fontWeight: 600 }}>Secure Payment</span>
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

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "We discovered CTO-level AI expertise on the platform—someone who accelerated our roadmap from months to weeks. That kind of talent brings tremendous value.",
    name: "Sarah M.", role: "CEO", company: "TechVenture", initials: "SM", color: "#0ea5e9",
  },
  {
    quote: "AI Marketplace isn't just a hiring platform—it's a strategic partner. It helped us fill every technical gap and bring on leaders who've become foundational to our business.",
    name: "Marcus L.", role: "Co-Founder & CEO", company: "DataFlow", initials: "ML", color: "#14a800",
  },
  {
    quote: "I found two incredible AI developers and ended up hiring both. I love the platform and the global pool of talent. We really couldn't be this far along without it.",
    name: "Julia K.", role: "Marketing Director", company: "GrowthCo", initials: "JK", color: "#f59e0b",
  },
  {
    quote: "This platform is paramount to our success. We can't accomplish what we do without our AI specialists. We fully consider them part of our team.",
    name: "Daniel R.", role: "CTO", company: "BuildStack", initials: "DR", color: "#8b5cf6",
  },
  {
    quote: "In this early stage, we needed to be lean and targeted. AI Marketplace helped us find people who are truly heart-driven and technically excellent at the same time.",
    name: "Amanda P.", role: "Founder & CEO", company: "ScaleOps", initials: "AP", color: "#ec4899",
  },
  {
    quote: "The safety features are great, but what really builds our confidence is consistently finding experts who deliver on highly technical, complex AI projects.",
    name: "Leo T.", role: "Product Lead", company: "InnovateCo", initials: "LT", color: "#ef4444",
  },
];

function TestimonialsSection() {
  return (
    <section style={{ padding: "72px 0", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#111827", marginBottom: "2.5rem", letterSpacing: "-0.02em" }}>
          Proven results on AI Marketplace
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                border: "1px solid #e5e7eb", borderRadius: 12,
                padding: "28px 28px 24px", background: "#fff",
                display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20,
              }}
            >
              <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.65, fontStyle: "italic" }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: t.color, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#111827" }}>{t.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{t.role}, {t.company}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{ padding: "40px 24px", background: "#f9fafb", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div
        style={{
          maxWidth: 1180, margin: "0 auto",
          background: "linear-gradient(135deg, #14a800 0%, #2fcf00 100%)",
          borderRadius: 16, padding: "56px 40px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
          Find AI specialists who can help you build what's next
        </h2>
        <Link
          href="/browse"
          style={{
            display: "inline-block", padding: "0.75rem 2rem",
            background: "#fff", color: "#111827",
            borderRadius: 30, fontSize: "0.95rem", fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            transition: "box-shadow 0.2s",
          }}
        >
          Explore specialists
        </Link>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER_COLS = [
  {
    heading: "For Clients",
    links: ["How to hire", "Talent Marketplace", "Project Catalog", "Hire an Agency", "Enterprise", "Business Plus", "Any Hire", "Contract-to-hire", "Direct Contracts", "Hire worldwide"],
  },
  {
    heading: "For Talent",
    links: ["How to find work", "Direct Contracts", "Find jobs worldwide", "Find jobs in the USA", "Win work with ads", "Freelancer Plus"],
  },
  {
    heading: "Resources",
    links: ["Help & support", "Success stories", "Platform reviews", "Resources", "Blog", "Affiliate program", "Refer a client", "Free Business Tools", "Release notes"],
  },
  {
    heading: "Company",
    links: ["About us", "Leadership", "Investor relations", "Careers", "Our impact", "Press", "Contact us", "Trust & safety", "Modern slavery statement"],
  },
];

const SOCIAL = [
  { icon: Facebook, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Twitter,  href: "#" },
  { icon: Youtube,  href: "#" },
  { icon: Instagram, href: "#" },
];

function Footer() {
  return (
    <footer style={{ background: "#1c1c1c", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 40px" }}>
        {/* 4-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2.5rem", marginBottom: "3rem" }}>
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <div style={{ fontSize: "0.78rem", color: "#9ca3af", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1rem" }}>
                {col.heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {col.links.map((l) => (
                  <Link
                    key={l}
                    href={`/${l.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ fontSize: "0.88rem", color: "#d1d5db", textDecoration: "none", lineHeight: 1.4 }}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #2d2d2d", paddingTop: "1.5rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              aimarket<span style={{ color: "#14a800" }}>.</span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Follow us</span>
            {SOCIAL.map(({ icon: Icon, href }, i) => (
              <Link key={i} href={href} style={{ color: "#9ca3af" }}>
                <Icon size={16} />
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Terms of Service", "Privacy Policy", "Cookie Settings"].map((l) => (
              <Link key={l} href="#" style={{ fontSize: "0.78rem", color: "#9ca3af", textDecoration: "none" }}>
                {l}
              </Link>
            ))}
            <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
              © 2026 AI Marketplace. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <TrustedSection />
      <CategoriesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
