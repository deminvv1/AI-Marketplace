"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";

const LandingGlobe = dynamic(
  () => import("@/components/globe/LandingGlobe"),
  { ssr: false }
);

type IntroPhase = "globe" | "reveal" | "ready";

export default function LandingPage() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>("globe");

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("reveal"), 2800);
    const t2 = setTimeout(() => setIntroPhase("ready"),  8500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isIntro   = introPhase !== "ready";
  const showBrand = introPhase !== "globe";

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: "#03050e" }}>

      {/* ── Full-screen Globe ────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <LandingGlobe selectedCountry={null} />
      </div>

      {/* ── Language Switcher (top-right) ────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>

      {/* ── Brand reveal — Universal Pictures style ──────────────────────── */}
      {/*    Text lives at bottom-center, slides up from below the frame      */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom: "clamp(8vh, 16vh, 20vh)" }}
      >
        <div
          style={{
            transform: showBrand ? "translateY(0px)" : "translateY(130px)",
            opacity:   showBrand ? 1 : 0,
            transition: "transform 2.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.8s ease",
          }}
        >
          {/* Main title — clean modern white */}
          <div style={{
            fontFamily:    "system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
            fontSize:      "clamp(2rem, 5.5vw, 6rem)",
            fontWeight:    700,
            letterSpacing: "0.22em",
            textAlign:     "center",
            lineHeight:    1,
            whiteSpace:    "nowrap",
            color:         "#ffffff",
            textShadow:    "0 0 80px rgba(100,160,255,0.35), 0 2px 40px rgba(0,0,0,0.6)",
          }}>
            AI MARKETPLACE
          </div>

          {/* Subtitle */}
          <div style={{
            textAlign:     "center",
            marginTop:     "1rem",
            fontSize:      "clamp(0.55rem, 1.1vw, 0.78rem)",
            letterSpacing: "0.50em",
            color:         "rgba(180,205,255,0.50)",
            fontFamily:    "system-ui, -apple-system, Helvetica, Arial, sans-serif",
            fontWeight:    300,
          }}>
            A GLOBAL AI PLATFORM
          </div>

          {/* CTA buttons — appear only in ready phase */}
          <div
            className="flex gap-4 justify-center pointer-events-auto"
            style={{
              marginTop:  "2.4rem",
              opacity:    isIntro ? 0 : 1,
              transform:  isIntro ? "translateY(14px)" : "translateY(0)",
              transition: "opacity 1.0s ease 0.2s, transform 1.0s ease 0.2s",
            }}
          >
            <Link
              href="/login"
              style={{
                padding:      "0.65rem 2rem",
                borderRadius: "999px",
                fontSize:     "0.82rem",
                fontWeight:   600,
                letterSpacing:"0.12em",
                color:        "rgba(220,230,255,0.90)",
                border:       "1px solid rgba(150,180,255,0.28)",
                backdropFilter: "blur(12px)",
                background:   "rgba(255,255,255,0.06)",
                transition:   "all 0.25s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(160,200,255,0.50)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(150,180,255,0.28)";
              }}
            >
              SIGN IN
            </Link>
            <Link
              href="/register"
              style={{
                padding:      "0.65rem 2rem",
                borderRadius: "999px",
                fontSize:     "0.82rem",
                fontWeight:   600,
                letterSpacing:"0.12em",
                color:        "#fff",
                border:       "1px solid rgba(140,180,255,0.35)",
                backdropFilter: "blur(12px)",
                background:   "rgba(90,120,255,0.22)",
                boxShadow:    "0 0 22px rgba(100,140,255,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
                transition:   "all 0.25s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(100,135,255,0.38)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 35px rgba(100,140,255,0.50), inset 0 1px 0 rgba(255,255,255,0.22)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(90,120,255,0.22)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 22px rgba(100,140,255,0.30), inset 0 1px 0 rgba(255,255,255,0.18)";
              }}
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </div>

      {/* ── Specialist counter (bottom-left) ─────────────────────────────── */}
      <div
        className="absolute bottom-6 left-6 z-30 flex items-center gap-3"
        style={{
          background:     "rgba(6,10,28,0.72)",
          backdropFilter: "blur(18px)",
          border:         "1px solid rgba(100,135,255,0.18)",
          borderRadius:   "14px",
          padding:        "0.6rem 1.1rem",
          opacity:    showBrand ? 1 : 0,
          transition: "opacity 1.6s ease 1.4s",
        }}
      >
        <span
          className="animate-pulse shrink-0"
          style={{
            display:     "inline-block",
            width:       8,
            height:      8,
            borderRadius: "50%",
            background:  "#4ade80",
            boxShadow:   "0 0 10px #4ade80",
          }}
        />
        <div>
          <div style={{
            fontSize:      "1.05rem",
            fontWeight:    700,
            color:         "#fff",
            letterSpacing: "0.04em",
            fontFamily:    "Arial, sans-serif",
          }}>
            2 684
          </div>
          <div style={{
            fontSize:      "0.58rem",
            color:         "rgba(165,192,255,0.55)",
            letterSpacing: "0.13em",
            textTransform: "uppercase",
          }}>
            Specialists Online
          </div>
        </div>
      </div>

      {/* ── Skip button (during intro) ────────────────────────────────────── */}
      {isIntro && (
        <button
          onClick={() => setIntroPhase("ready")}
          className="absolute bottom-6 right-6 z-30 px-4 py-2 rounded-lg border border-white/15 text-white/45 text-xs tracking-widest hover:text-white/75 hover:border-white/30 transition-all"
        >
          SKIP ›
        </button>
      )}

      {/* Bottom gradient vignette — helps text readability over the globe */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height:     "55vh",
          background: "linear-gradient(to top, rgba(3,5,14,0.80) 0%, rgba(3,5,14,0.30) 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
