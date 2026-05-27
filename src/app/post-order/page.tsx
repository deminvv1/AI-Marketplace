"use client"; // Обязательно, так как здесь интерактивная форма, кнопки и в будущем будет стейт для шагов

import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { Check } from "lucide-react";

const steps = ["Basic Info", "Details", "Budget & Deadline", "Review"];

export default function PostOrderPage() {
  return (
    <AppShell title="Post New Order">
      <div className="max-w-4xl mx-auto">
        {/* Степпер (Шаги) */}
        <ol className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`size-8 rounded-full grid place-items-center text-xs font-semibold ${i === 0 ? "bg-gradient-primary text-white glow-primary" : "bg-white/5 border border-border text-muted-foreground"}`}
              >
                {i === 0 ? i + 1 : i + 1}
              </div>
              <span
                className={`text-sm ${i === 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-border" />}
            </li>
          ))}
        </ol>

        {/* Форма */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              defaultValue="Medical imaging classifier for radiology clinic"
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Industry</label>
            <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
              {INDUSTRIES.slice(0, 10).map((i, idx) => (
                <button
                  key={i.name}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition ${idx === 0 ? "bg-primary/15 border-primary/50 glow-primary" : "bg-white/5 border-border hover:border-primary/40"}`}
                >
                  <span className="text-2xl">{i.icon}</span>
                  <span className="text-xs">{i.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Subcategory</label>
            <select className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all">
              <option>Diagnostic imaging</option>
              <option>Drug discovery</option>
              <option>Patient triage</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Short description</label>
              <span className="text-xs text-muted-foreground">142 / 200</span>
            </div>
            <textarea
              defaultValue="Need a CNN model trained on chest X-rays to detect early pneumonia signs with 95%+ accuracy. HIPAA compliance required."
              rows={3}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button className="h-10 px-4 rounded-xl bg-white/5 border border-border text-sm">
              Save draft
            </button>
            <button className="h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary inline-flex items-center gap-2">
              Continue <Check className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
