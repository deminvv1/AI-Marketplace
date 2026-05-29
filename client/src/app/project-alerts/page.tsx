"use client";

/**
 * Project alerts — подписки на новые проекты (FREELANCER / BOTH).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES } from "@/lib/mock-data";
import {
  createProjectAlert,
  deleteProjectAlert,
  getProjectAlerts,
  updateProjectAlert,
  type ProjectAlertItem,
} from "@/app/actions/project-alerts";
import { Bell, Loader2, Plus, Trash2 } from "lucide-react";

export default function ProjectAlertsPage() {
  const [alerts, setAlerts] = useState<ProjectAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [q, setQ] = useState("");
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await getProjectAlerts();
    if ("error" in res && res.error) setError(res.error);
    else if (Array.isArray(res)) setAlerts(res);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!industry && !country && !q.trim()) {
      setError("Set at least one filter: industry, country, or keyword.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await createProjectAlert({
      label: label || undefined,
      industry: industry || undefined,
      country: country || undefined,
      q: q.trim() || undefined,
      notifyByEmail,
    });
    setSubmitting(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    setShowForm(false);
    setLabel("");
    setIndustry("");
    setCountry("");
    setQ("");
    await load();
  }

  async function toggleActive(alert: ProjectAlertItem) {
    await updateProjectAlert(alert.id, { isActive: !alert.isActive });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this alert?")) return;
    await deleteProjectAlert(id);
    await load();
  }

  return (
    <AppShell title="Project alerts">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="size-6 text-primary" />
              Project alerts
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get notified when a new open project matches your filters (in-app and email).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="size-4" />
            New alert
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Label (optional)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. LLM projects in EU"
                className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
              >
                <option value="">Any</option>
                {INDUSTRIES.map((i) => (
                  <option key={i.name} value={i.name}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Germany"
                className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Keyword</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="LLM, NLP, PyTorch…"
                className="mt-2 w-full h-10 px-3 rounded-xl bg-white/5 border border-border text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyByEmail}
                onChange={(e) => setNotifyByEmail(e.target.checked)}
              />
              Email me (requires RESEND_API_KEY on server)
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Create alert"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            No alerts yet.{" "}
            <Link href="/projects" className="text-primary hover:underline">
              Browse projects
            </Link>{" "}
            and save filters as an alert.
          </div>
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="glass rounded-xl p-4 flex flex-wrap items-start justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-sm">
                    {a.label || "Untitled alert"}
                    {!a.isActive && (
                      <span className="ml-2 text-xs text-muted-foreground">(paused)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                    {a.industry && <span>{a.industry}</span>}
                    {a.country && <span>· {a.country}</span>}
                    {a.q && <span>· “{a.q}”</span>}
                    {a.notifyByEmail && <span>· email on</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(a)}
                    className="h-8 px-3 rounded-lg border border-border text-xs"
                  >
                    {a.isActive ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="h-8 px-3 rounded-lg border border-destructive/40 text-destructive text-xs inline-flex items-center gap-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
