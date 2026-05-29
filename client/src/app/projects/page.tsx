"use client"; // Обязательно, так как используются интерактивные фильтры, поиск и генерация Math.random() на клиенте

import { AppShell } from "@/components/app-shell";
import { PROJECTS, INDUSTRIES, flag } from "@/lib/mock-data";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui-bits";

export default function ProjectsPage() {
  return (
    <AppShell title="Projects">
      {/* Заголовок и быстрые фильтры */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse AI Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            3,291 open projects across 62 countries
          </p>
        </div>
        <div className="flex gap-2">
          {["Industry", "Budget", "Country", "Status", "Sort: Newest"].map((f) => (
            <button
              key={f}
              className="h-9 px-3 rounded-lg glass text-xs border border-border hover:border-primary/50 transition inline-flex items-center gap-2"
            >
              <SlidersHorizontal className="size-3.5" /> {f}
            </button>
          ))}
        </div>
      </div>

      {/* Инпут поиска */}
      <div className="relative mb-6">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search projects by keyword, industry, or specialist…"
          className="w-full h-11 pl-10 pr-3 rounded-xl glass border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
        />
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-12 gap-6">
        {/* Боковая панель с категориями индустрий */}
        <aside className="col-span-12 md:col-span-3 glass rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Industries
          </h3>
          <ul className="space-y-1">
            {INDUSTRIES.map((i, idx) => (
              <li key={i.name}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${idx === 0 ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-2">
                    {i.icon} {i.name}
                  </span>
                  <span className="text-xs opacity-60">{Math.floor(50 + Math.random() * 400)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Сетка карточек заказов */}
        <div className="col-span-12 md:col-span-9 grid sm:grid-cols-2 gap-4">
          {PROJECTS.map((o) => (
            <article key={o.id} className="glass glass-hover rounded-2xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold leading-snug">{o.title}</h4>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{o.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-primary/15 text-primary border border-primary/30">
                  {o.industry}
                </span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-border text-muted-foreground">
                  {flag(o.country)} {o.country}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t border-border pt-4">
                <div>
                  <div className="text-foreground font-medium">{o.budget}</div>Budget
                </div>
                <div>
                  <div className="text-foreground font-medium">{o.deadline}</div>Deadline
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Posted {o.date}</span>
                <button className="h-8 px-3 rounded-lg border border-primary/50 text-primary text-xs font-medium hover:bg-primary/15 transition inline-flex items-center gap-1">
                  Send proposal <ArrowRight className="size-3" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
