"use client";

/**
 * Каталог проектов: GET /api/projects (только status=OPEN на бэке).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { INDUSTRIES, flag } from "@/lib/mock-data";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui-bits";
import { getProjects, type ProjectListItem } from "@/app/actions/projects";
import {
  formatDeadline,
  formatPostedAt,
  projectStatusForUi,
} from "@/lib/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getProjects();
      if (cancelled) return;
      if ("error" in result && result.error) {
        setError(result.error);
        setProjects([]);
      } else if (Array.isArray(result)) {
        setProjects(result);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = projects.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const hay = [p.title, p.shortDescription, p.description, p.industry, ...p.tags]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return (
    <AppShell title="Projects">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse AI Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${filtered.length} open project${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-xs font-medium glow-primary inline-flex items-center"
        >
          Post a project
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by keyword, industry, or specialist…"
          className="w-full h-11 pl-10 pr-3 rounded-xl glass border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 glass rounded-2xl p-5 h-fit sticky top-24">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Industries
          </h3>
          <ul className="space-y-1">
            {INDUSTRIES.map((i, idx) => (
              <li key={i.name}>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${idx === 0 ? "bg-primary/15 text-primary border border-primary/30" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                >
                  <span className="flex items-center gap-2">
                    {i.icon} {i.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="col-span-12 md:col-span-9">
          {loading && (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-destructive glass rounded-2xl p-6">{error}</p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground glass rounded-2xl p-6">
              No open projects yet.{" "}
              <Link href="/projects/new" className="text-primary hover:underline">
                Post the first one
              </Link>
              .
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((o) => (
              <article key={o.id} className="glass glass-hover rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/projects/${o.id}`} className="font-semibold leading-snug hover:text-primary">
                    {o.title}
                  </Link>
                  <StatusBadge status={projectStatusForUi(o.status)} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {o.shortDescription || o.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  {o.industry && (
                    <span className="px-2 py-1 rounded-md bg-primary/15 text-primary border border-primary/30">
                      {o.industry}
                    </span>
                  )}
                  {o.country && (
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-border text-muted-foreground">
                      {flag(o.country)} {o.country}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t border-border pt-4">
                  <div>
                    <div className="text-foreground font-medium">
                      {o.budget || "Budget TBD"}
                    </div>
                    Budget
                  </div>
                  <div>
                    <div className="text-foreground font-medium">
                      {formatDeadline(o.deadline)}
                    </div>
                    Deadline
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Posted {formatPostedAt(o.createdAt)}
                    {o._count.proposals > 0 && ` · ${o._count.proposals} proposals`}
                  </span>
                  <Link
                    href={`/projects/${o.id}`}
                    className="h-8 px-3 rounded-lg border border-primary/50 text-primary text-xs font-medium hover:bg-primary/15 transition inline-flex items-center gap-1"
                  >
                    View & propose <ArrowRight className="size-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
