"use client"; // Обязательно, так как здесь есть инпуты, кнопки переключения табов и формы ответов

import { AppShell } from "@/components/app-shell";
import { FORUM_CATEGORIES, THREADS, flag } from "@/lib/mock-data";
import { Plus, Search, ThumbsUp, MessageSquare, Languages } from "lucide-react";

export default function ForumPage() {
  return (
    <AppShell title="Forum">
      <div className="grid grid-cols-12 gap-6">
        {/* Левый сайдбар — Категории */}
        <aside className="col-span-12 lg:col-span-3 glass rounded-2xl p-5 h-fit">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Categories
          </h3>
          <ul className="space-y-1">
            {FORUM_CATEGORIES.map((c, i) => (
              <li key={c.name}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${i === 0 ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-2">
                    {c.icon} {c.name}
                  </span>
                  <span className="text-xs opacity-60">{c.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Центральная лента топиков */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="flex items-center gap-3">
            <button className="h-10 px-4 rounded-xl bg-secondary text-white text-sm font-medium glow-secondary inline-flex items-center gap-2">
              <Plus className="size-4" /> New Topic
            </button>
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search threads…"
                className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-border text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            {["Popular", "New", "My Country", "My Industry"].map((t, i) => (
              <button
                key={t}
                className={`px-3 py-1.5 rounded-full border ${i === 0 ? "bg-primary/15 border-primary/40 text-primary" : "bg-white/5 border-border text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {THREADS.map((t) => (
            <article key={t.id} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold shrink-0">
                  {t.author[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">{t.author}</span>
                    <span>·</span>
                    <span>
                      {flag(t.country)} {t.country}
                    </span>
                    <span>·</span>
                    <span>{t.time}</span>
                    {t.translated && (
                      <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning border border-warning/30 inline-flex items-center gap-1">
                        <Languages className="size-3" /> Auto-translated
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 font-semibold leading-snug">{t.title}</h4>
                  <div className="mt-1 flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                      {t.cat}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/30">
                      {t.industry}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{t.preview}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="size-3.5" /> {t.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> {t.comments}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Правый сайдбар — Развернутая ветка (Expanded thread) */}
        <aside className="col-span-12 lg:col-span-3 glass rounded-2xl p-5 h-fit">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Expanded thread
          </div>
          <h4 className="font-semibold">Best open-source LLM for medical Q&A in 2026?</h4>
          <div className="mt-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30 text-xs text-warning inline-flex items-center gap-2">
            <Languages className="size-3.5" /> Auto-translated from Russian
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {
              "We've tested Llama 3.3, Mistral, and a fine-tuned Phi-4. Surprisingly, Phi-4 outperformed the rest on MedQA…"
            }
          </p>

          <div className="mt-4 space-y-3">
            {["Marcus Chen", "Yuki Tanaka"].map((n) => (
              <div key={n} className="flex gap-2">
                <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold shrink-0">
                  {n[0]}
                </div>
                <div className="text-xs">
                  <span className="font-medium">{n}</span>
                  <p className="text-muted-foreground mt-0.5">
                    Great find — what was your eval setup?
                  </p>
                </div>
              </div>
            ))}
          </div>

          <textarea
            placeholder="Write a reply…"
            rows={2}
            className="mt-4 w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition resize-none"
          />
          <button className="mt-2 w-full h-9 rounded-lg bg-gradient-primary text-white text-xs font-medium glow-primary">
            Post Reply
          </button>
        </aside>
      </div>
    </AppShell>
  );
}
