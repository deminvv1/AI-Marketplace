"use client";

/**
 * Страница публикации проекта (заказчик).
 * POST → /api/projects через createProject() в actions/projects.ts
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { createProject } from "@/app/actions/projects";
import { Check, Loader2 } from "lucide-react";

export default function PostProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]?.name ?? "");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createProject({
      title,
      description,
      shortDescription: shortDescription || undefined,
      industry: industry || undefined,
      budget: budget || undefined,
      deadline: deadline || undefined,
      country: country || undefined,
    });

    setSubmitting(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <AppShell title="Post a project">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Medical imaging classifier for radiology clinic"
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Industry</label>
            <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-3">
              {INDUSTRIES.slice(0, 10).map((i) => (
                <button
                  key={i.name}
                  type="button"
                  onClick={() => setIndustry(i.name)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition ${industry === i.name ? "bg-primary/15 border-primary/50 glow-primary" : "bg-white/5 border-border hover:border-primary/40"}`}
                >
                  <span className="text-2xl">{i.icon}</span>
                  <span className="text-xs">{i.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Short description</label>
              <span className="text-xs text-muted-foreground">
                {shortDescription.length} / 200
              </span>
            </div>
            <textarea
              maxLength={200}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary for the project card…"
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Full description</label>
            <textarea
              required
              minLength={20}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Scope, deliverables, compliance requirements…"
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Budget</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="$3,500 – $7,000"
                className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Germany"
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-10 px-4 rounded-xl bg-white/5 border border-border text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Publish project
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
