"use client";

import { AppShell } from "@/components/app-shell";
import { SOLUTIONS } from "@/lib/mock-data";
import { Stars } from "@/components/ui-bits";

const gradients = [
  "linear-gradient(135deg,#1e293b,#6366f1)",
  "linear-gradient(135deg,#312e81,#06b6d4)",
  "linear-gradient(135deg,#4c1d95,#ec4899)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#1f2937,#f59e0b)",
  "linear-gradient(135deg,#831843,#6366f1)",
];

export default function SolutionsPage() {
  return (
    <AppShell title="Solutions">
      {/* Шапка и фильтры */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Solutions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plug-and-play solutions from vetted specialists
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Industry", "Format", "Price", "Country", "Language"].map((f) => (
            <button
              key={f}
              className="h-9 px-3 rounded-lg glass border border-border hover:border-primary/50 transition text-xs"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Сетка готовых предложений */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SOLUTIONS.map((o, i) => (
          <article
            key={o.title}
            className="glass glass-hover rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Обложка с градиентом */}
            <div className="h-40 relative" style={{ background: gradients[i % gradients.length] }}>
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/30 backdrop-blur text-[10px] uppercase tracking-widest text-white border border-white/20">
                {o.format}
              </div>
            </div>

            {/* Контент карточки */}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h4 className="font-semibold leading-snug">{o.title}</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                  {o.industry}
                </span>
              </div>

              {/* Прайс */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="text-base font-bold text-gradient">{o.price}</div>
              </div>

              {/* Автор решения */}
              <div className="flex items-center gap-2 pt-1">
                <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold">
                  {o.author[0]}
                </div>
                <div className="text-xs flex-1">
                  <div className="font-medium">{o.author}</div>
                  <div className="text-muted-foreground">
                    <Stars value={o.rating} /> {o.rating}
                  </div>
                </div>
              </div>

              {/* Действия */}
              <div className="flex gap-2">
                <button className="flex-1 h-9 rounded-lg bg-gradient-primary text-white text-xs font-medium glow-primary">
                  Contact
                </button>
                <button className="flex-1 h-9 rounded-lg border border-border bg-white/5 text-xs">
                  Discuss
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
