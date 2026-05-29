"use client";

/**
 * Редактирование проекта: PATCH /api/projects/:id
 * Доступно владельцу, пока status === OPEN.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import { getProject, updateProject } from "@/app/actions/projects";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

function deadlineInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]?.name ?? "");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const result = await getProject(projectId);
      if ("error" in result && result.error) {
        setForbidden(result.error);
        setLoading(false);
        return;
      }
      if (!("id" in result)) {
        setForbidden("Project not found");
        setLoading(false);
        return;
      }
      if (result.status !== "OPEN") {
        setForbidden("Only open projects can be edited.");
        setLoading(false);
        return;
      }
      setTitle(result.title);
      setIndustry(result.industry ?? INDUSTRIES[0]?.name ?? "");
      setShortDescription(result.shortDescription ?? "");
      setDescription(result.description);
      setBudget(result.budget ?? "");
      setDeadline(deadlineInputValue(result.deadline));
      setCountry(result.country ?? "");
      setLoading(false);
    })();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updateProject(projectId, {
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

    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell title="Edit project">
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (forbidden) {
    return (
      <AppShell title="Edit project">
        <p className="text-destructive text-sm">{forbidden}</p>
        <Link
          href={`/projects/${projectId}`}
          className="text-primary text-sm mt-4 inline-block"
        >
          ← Back to project
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Edit project">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> Back to project
      </Link>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              required
              minLength={5}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition-all"
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
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm resize-none"
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
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-border text-sm resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Budget</label>
              <input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 w-full h-11 px-3 rounded-xl bg-white/5 border border-border text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive border border-destructive/30 bg-destructive/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Link
              href={`/projects/${projectId}`}
              className="h-10 px-4 rounded-xl bg-white/5 border border-border text-sm inline-flex items-center"
            >
              Cancel
            </Link>
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
              Save changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
