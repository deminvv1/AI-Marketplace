"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, Sparkles } from "lucide-react";
import { COUNTRIES, flag } from "@/lib/mock-data";
import { getCountryCoords } from "@/lib/country-coords";

const LandingGlobe = dynamic(
  () => import("@/components/globe/LandingGlobe"),
  { ssr: false }
);

interface SelectedCountry {
  name: string;
  lat: number;
  lng: number;
}

export default function LandingPage() {
  const [q, setQ] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [zooming, setZooming] = useState(false);

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

  return (
    <div className="relative h-screen overflow-hidden bg-[#060912]">
      {/* Three.js fullscreen scene */}
      <LandingGlobe selectedCountry={selectedCountry} />

      {/* Left sidebar — matches AppShell style */}
      <aside
        className={`absolute left-0 top-0 h-full w-64 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl z-10 flex flex-col transition-all duration-700 ${
          zooming ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
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

        {/* Bottom stat — styled like AppShell user card */}
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
