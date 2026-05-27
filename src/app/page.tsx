"use client";

import { useMemo, useState } from "react";
import Link from "next/link"; // Роутинг Next.js вместо TanStack
import Image from "next/image"; // Оптимизированный компонент картинок Next.js
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { COUNTRIES, flag } from "@/lib/mock-data";

import earthImg from "@/assets/earth-globe.jpg";
import mascotImg from "@/assets/mascot.png";

export default function LandingPage() {
  const [q, setQ] = useState("");
  
  const filtered = useMemo(
    () => COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Stars background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 80%, white, transparent), radial-gradient(2px 2px at 40% 60%, white, transparent), radial-gradient(1px 1px at 90% 20%, white, transparent), radial-gradient(1px 1px at 10% 80%, white, transparent), radial-gradient(1px 1px at 60% 10%, white, transparent)",
          backgroundSize: "300px 300px",
        }}
      />

      {/* LEFT: countries sidebar */}
      <aside className="w-[34%] min-w-[320px] max-w-[460px] border-r border-border/60 bg-sidebar/70 backdrop-blur-2xl relative z-10 flex flex-col h-screen">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-border/60">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight">AI Marketplace</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Global</div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search countries…"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-6 [scrollbar-color:theme(colors.primary)_transparent] [scrollbar-width:thin]">
          {filtered.map((c) => (
            <Link
              key={c}
              href="/welcome" // Заменили to на href
              className="group flex items-center justify-between px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground border-l-2 border-transparent hover:border-primary hover:bg-primary/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{flag(c)}</span>
                {c}
              </span>
              <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 text-primary transition" />
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              {"No countries match \""}{q}{"\""}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT: spinning globe */}
      <section className="flex-1 relative flex items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15), transparent 50%)",
          }}
        />
        <div className="relative w-[min(70vh,640px)] aspect-square">
          {/* Orbital ring */}
          <div className="absolute inset-[-8%] rounded-full border border-primary/30 animate-spin-slow"
            style={{ boxShadow: "0 0 60px rgba(99,102,241,0.25) inset, 0 0 60px rgba(99,102,241,0.2)" }}>
            <svg viewBox="0 0 600 600" className="w-full h-full">
              <defs>
                <path id="orbitPath" d="M 300,300 m -290,0 a 290,290 0 1,1 580,0 a 290,290 0 1,1 -580,0" />
              </defs>
              <text className="fill-primary text-[22px] tracking-[0.4em] font-semibold uppercase">
                <textPath href="#orbitPath" startOffset="0">AI Marketplace · Global · AI Marketplace · Worldwide · </textPath>
              </text>
            </svg>
          </div>
          <div className="absolute inset-[6%] rounded-full border border-secondary/20 animate-spin-reverse-slow" />

          {/* Globe */}
          <div className="absolute inset-[10%] rounded-full overflow-hidden animate-float-y animate-pulse-glow">
            <Image 
              src={earthImg} 
              alt="Earth globe" 
              className="w-full h-full object-cover" 
              width={1024} 
              height={1024}
              priority // Загружается мгновенно без LCP-задержек
            />
          </div>

          {/* Mascot on ring */}
          <Image
            src={mascotImg}
            alt="Mascot"
            width={160}
            height={160}
            priority
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]"
          />
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Select your country to begin</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            62 countries · 12,840 specialists online
          </div>
        </div>
      </section>
    </div>
  );
}