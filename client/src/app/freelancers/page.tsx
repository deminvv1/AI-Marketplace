"use client"; // Обязательно, так как используются клиентские компоненты, табы на кнопках и градиенты inline-styles

import { AppShell } from "@/components/app-shell";
import { FREELANCERS, flag } from "@/lib/mock-data";
import { MessageCircle, Mic, UserPlus, Briefcase } from "lucide-react";
import { Stars } from "@/components/ui-bits";

// Берем нужного исполнителя из моков
const E = FREELANCERS[1];

export default function FreelancersPage() {
  return (
    <AppShell title="Freelancer Profile">
      {/* Шапка профиля */}
      <div className="rounded-3xl overflow-hidden glass">
        <div
          className="h-48 relative"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.4 0.25 295) 0%, oklch(0.4 0.22 265) 50%, oklch(0.45 0.18 215) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, white, transparent 30%), radial-gradient(circle at 80% 60%, white, transparent 40%)",
            }}
          />
        </div>
        <div className="p-6 pt-0 -mt-16 flex flex-wrap items-end gap-6">
          <div className="relative">
            <div className="size-32 rounded-2xl bg-gradient-primary border-4 border-background grid place-items-center text-4xl font-bold glow-primary">
              A
            </div>
            <span className="absolute bottom-2 right-2 size-4 rounded-full bg-success border-4 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold">{E.name}</h2>
              <span className="text-muted-foreground">{E.handle}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-border text-xs">
                {flag(E.country)} {E.country}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={E.rating} />{" "}
              <span className="text-foreground font-medium">{E.rating}</span> · {E.reviews} reviews
              · {E.specialty}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary inline-flex items-center gap-2">
              <MessageCircle className="size-4" />
              Write
            </button>
            <button className="h-10 px-4 rounded-xl glass border border-border text-sm inline-flex items-center gap-2">
              <Mic className="size-4" />
              Voice
            </button>
            <button className="h-10 px-4 rounded-xl glass border border-border text-sm inline-flex items-center gap-2">
              <UserPlus className="size-4" />
              Invite
            </button>
          </div>
        </div>

        {/* Табы навигации */}
        <div className="px-6 border-t border-border">
          <nav className="flex gap-1 overflow-x-auto">
            {["About", "Portfolio", "Solutions", "Completed Projects", "Reviews"].map((t, i) => (
              <button
                key={t}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${i === 0 ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Основная сетка контента */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Секция О себе */}
          <section className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              NLP researcher and engineer based in Kyiv. 7 years building production language
              systems for healthcare, fintech, and legal clients across the EU and APAC. I
              specialize in fine-tuning open-weight LLMs for domain-specific tasks, building robust
              evaluation harnesses, and shipping inference at scale on tight budgets. Currently
              fascinated by small specialized models and synthetic data pipelines.
            </p>
            <div className="mt-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Specialization
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "NLP",
                  "LLM fine-tuning",
                  "RAG systems",
                  "Synthetic data",
                  "Evaluation",
                  "Inference optimization",
                ].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Industries
              </div>
              <div className="flex flex-wrap gap-2">
                {["Medicine", "Finance", "Legal", "Education"].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Портфолио */}
          <section className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Portfolio</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { h: 220, bg: "linear-gradient(135deg, #1e293b, #6366f1)" },
                { h: 160, bg: "linear-gradient(135deg, #312e81, #06b6d4)" },
                { h: 200, bg: "linear-gradient(135deg, #4c1d95, #ec4899)" },
                { h: 180, bg: "linear-gradient(135deg, #064e3b, #10b981)" },
                { h: 240, bg: "linear-gradient(135deg, #1f2937, #f59e0b)" },
                { h: 170, bg: "linear-gradient(135deg, #831843, #6366f1)" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border overflow-hidden relative"
                  style={{ height: p.h, background: p.bg }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-2 left-2 text-xs text-white/90 font-medium">
                    Project {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Сайдбар со статистикой */}
        <aside className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Quick stats</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Projects completed</dt>
                <dd className="font-medium">48</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="font-medium">{E.rating} / 5</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Languages</dt>
                <dd className="font-medium">EN · RU · DE</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Avg response</dt>
                <dd className="font-medium">~2 hours</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">2024</dd>
              </div>
            </dl>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Briefcase className="size-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Open to new projects</div>
                <div className="text-xs text-muted-foreground">Available from Aug 1, 2026</div>
              </div>
            </div>
            
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
