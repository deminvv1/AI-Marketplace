"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, Sparkles } from "lucide-react";
import { COUNTRIES, flag } from "@/lib/mock-data";
import { getCountryCoords } from "@/lib/country-coords";
import { LanguageSwitcher } from "@/components/language-switcher";

const LandingGlobe = dynamic(
  () => import("@/components/globe/LandingGlobe"),
  { ssr: false }
);

interface SelectedCountry {
  name: string;
  lat: number;
  lng: number;
}

type IntroPhase = "globe" | "brand" | "crawl" | "ready";

const CRAWL_TEXT = [
  "Международная AI-платформа нового поколения,",
  "объединяющая талантливых специалистов,",
  "разработчиков, инженеров, креаторов",
  "и заказчиков со всего мира.",
  "",
  "От генерации стихов, музыки и визуального",
  "контента — до высокотехнологичных",
  "инженерных решений, робототехники",
  "и разработок в сфере ракетостроения.",
  "",
  "Платформа создаёт единую экосистему,",
  "где исполнители объединяются в команды,",
  "масштабируют идеи и запускают стартапы,",
  "а заказчики находят профессионалов",
  "со всего мира.",
  "",
  "Будущее создаётся здесь.",
];

export default function LandingPage() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>("globe");
  const [q, setQ] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [zooming, setZooming] = useState(false);

  // Intro sequence timing
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("brand"), 3500);
    const t2 = setTimeout(() => setIntroPhase("crawl"), 5500);
    const t3 = setTimeout(() => setIntroPhase("ready"), 13000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  function skipIntro() {
    setIntroPhase("ready");
  }

  const filtered = useMemo(
    () => COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  function handleCountryClick(name: string) {
    if (zooming) return;
    setZooming(true);
    const coords = getCountryCoords(name);
    setSelectedCountry({ name, lat: coords.lat, lng: coords.lng });
  }

  const isIntro = introPhase !== "ready";

  return (
    <div className="relative h-screen overflow-hidden bg-[#060912]">

      {/* ── Globe (always rendered, fades out after intro) ── */}
      <div
        className="absolute inset-0 transition-opacity duration-[1800ms]"
        style={{ opacity: introPhase === "brand" || introPhase === "crawl" ? 0 : 1 }}
      >
        <LandingGlobe selectedCountry={isIntro ? null : selectedCountry} />
      </div>

      {/* ── Language switcher ── */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageSwitcher />
      </div>

      {/* ── INTRO: Brand name reveal ── */}
      {(introPhase === "brand" || introPhase === "crawl") && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{
            opacity: introPhase === "brand" ? 1 : 0,
            transition: "opacity 1.2s ease",
          }}
        >
          <div className="text-center select-none">
            <div
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontSize: "clamp(2.5rem, 8vw, 7rem)",
                fontWeight: 900,
                letterSpacing: "0.15em",
                color: "rgba(255,250,240,0.95)",
                textShadow: "0 0 40px rgba(160,100,255,0.7), 0 0 80px rgba(100,60,200,0.4)",
                lineHeight: 1.1,
              }}
            >
              AI MARKETPLACE
            </div>
            <div
              style={{
                fontSize: "clamp(0.7rem, 1.5vw, 1rem)",
                letterSpacing: "0.5em",
                color: "rgba(180,160,255,0.7)",
                marginTop: "1rem",
                fontWeight: 400,
              }}
            >
              GLOBAL · NEXT GENERATION
            </div>
          </div>
        </div>
      )}

      {/* ── INTRO: Star Wars crawl ── */}
      {introPhase === "crawl" && (
        <div
          className="absolute inset-0 z-20 flex items-end justify-center overflow-hidden"
          style={{ perspective: "350px" }}
        >
          <div
            style={{
              width: "min(600px, 90vw)",
              transformOrigin: "50% 100%",
              transform: "rotateX(22deg)",
              animation: "starWarsCrawl 8s linear forwards",
              paddingBottom: "10vh",
            }}
          >
            {CRAWL_TEXT.map((line, i) => (
              <p
                key={i}
                style={{
                  textAlign: "center",
                  color: line === "" ? "transparent" : "rgba(220,200,255,0.92)",
                  fontSize: "clamp(0.85rem, 1.8vw, 1.15rem)",
                  lineHeight: 1.75,
                  fontWeight: line.startsWith("Будущее") ? 700 : 400,
                  letterSpacing: "0.03em",
                  textShadow: "0 0 20px rgba(160,100,255,0.5)",
                  marginBottom: line === "" ? "1.5rem" : 0,
                }}
              >
                {line || " "}
              </p>
            ))}
          </div>

          <style>{`
            @keyframes starWarsCrawl {
              from { transform: rotateX(22deg) translateY(100vh); }
              to   { transform: rotateX(22deg) translateY(-160%); }
            }
          `}</style>
        </div>
      )}

      {/* ── Skip button (during intro) ── */}
      {isIntro && (
        <button
          onClick={skipIntro}
          className="absolute bottom-6 right-6 z-30 px-4 py-2 rounded-lg border border-white/15 text-white/50 text-xs tracking-widest hover:text-white/80 hover:border-white/30 transition-all"
        >
          SKIP ›
        </button>
      )}

      {/* ── Normal landing (sidebar + content) ── */}
      <aside
        className={`absolute left-0 top-0 h-full w-64 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl z-10 flex flex-col transition-all duration-700 ${
          isIntro || zooming ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow-primary shrink-0">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight">AI Marketplace</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Global · v1
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search countries…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </div>
        </div>

        {/* Country list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 [scrollbar-color:theme(colors.primary/40)_transparent] [scrollbar-width:thin]">
          {filtered.map((c) => (
            <button
              key={c}
              onClick={() => handleCountryClick(c)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all text-left"
            >
              <span className="text-base leading-none shrink-0">{flag(c)}</span>
              <span className="flex-1 truncate">{c}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No countries match &ldquo;{q}&rdquo;
            </p>
          )}
        </div>

        {/* Bottom stat */}
        <div className="p-4 border-t border-border/60">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-primary grid place-items-center shrink-0">
              <span className="text-[10px] font-bold text-white">62</span>
            </div>
            <div className="text-xs min-w-0">
              <div className="font-medium truncate">Select your country</div>
              <div className="text-muted-foreground flex items-center gap-1.5 truncate">
                <span className="size-1.5 rounded-full bg-primary animate-pulse inline-block shrink-0" />
                12,840 specialists online
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
