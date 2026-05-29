"use client";

/**
 * Каталог: GET /api/projects?industry=&country=&q=
 * На бэке только status=OPEN — завершённые (COMPLETED) не показываются.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { flag } from "@/lib/mock-data";
import { Search, ArrowRight, Loader2, X, Bell } from "lucide-react";
import { createProjectAlert } from "@/app/actions/project-alerts";
import { StatusBadge } from "@/components/ui-bits";
import {
  CatalogIndustryList,
  CatalogSkillChips,
} from "@/components/catalog-taxonomy-filters";
import { getProjects, type ProjectListItem } from "@/app/actions/projects";
import {
  formatDeadline,
  formatPostedAt,
  projectStatusForUi,
} from "@/lib/projects";
import { useTaxonomy } from "@/lib/use-taxonomy";
import { skillLabel } from "@/lib/taxonomy";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { categories, skills } = useTaxonomy();
  const [industry, setIndustry] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  async function saveAsAlert() {
    if (!hasFilters) {
      setAlertMsg("Set industry, country, or keyword first.");
      return;
    }
    setAlertSaving(true);
    setAlertMsg(null);
    const res = await createProjectAlert({
      industry: industry ?? undefined,
      country: country.trim() || undefined,
      q: query.trim() || undefined,
      tags: tag ? [tag] : undefined,
      notifyByEmail: true,
    });
    setAlertSaving(false);
    if ("error" in res && res.error) setAlertMsg(res.error);
    else setAlertMsg("Alert saved! You will be notified about matching projects.");
  }

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      const result = await getProjects({
        industry: industry ?? undefined,
        tag: tag ?? undefined,
        country: country.trim() || undefined,
        q: query.trim() || undefined,
      });
      if (cancelled) return;
      if ("error" in result && result.error) {
        setError(result.error);
        setProjects([]);
      } else if (Array.isArray(result)) {
        setProjects(result);
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, industry, tag, country]);

  const hasFilters = !!(industry || tag || country.trim() || query.trim());

  return (
    <AppShell title="Projects">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Browse AI Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? "Loading…"
              : `${projects.length} open project${projects.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-xs font-medium glow-primary inline-flex items-center"
        >
          Post a project
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keyword, industry, tags…"
          className="w-full h-11 pl-10 pr-3 rounded-xl glass border border-border text-sm focus:outline-none focus:border-primary focus:glow-primary transition-all"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs text-muted-foreground">Country filter</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. Germany"
          className="mt-1 w-full max-w-xs h-9 px-3 rounded-lg glass border border-border text-sm"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setIndustry(null);
              setTag(null);
              setCountry("");
              setQuery("");
            }}
            className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
          >
            <X className="size-3" /> Clear filters
          </button>
        )}
        <button
          type="button"
          disabled={alertSaving || !hasFilters}
          onClick={saveAsAlert}
          className="text-xs inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:border-primary/40 disabled:opacity-50"
        >
          <Bell className="size-3.5" />
          {alertSaving ? "Saving…" : "Save as project alert"}
        </button>
        <Link href="/project-alerts" className="text-xs text-muted-foreground hover:text-primary">
          Manage alerts →
        </Link>
        {alertMsg && <span className="text-xs text-muted-foreground">{alertMsg}</span>}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 glass rounded-2xl p-5 h-fit sticky top-24 space-y-6">
          {categories.length > 0 && (
            <CatalogIndustryList
              categories={categories}
              value={industry}
              onChange={setIndustry}
            />
          )}
          <CatalogSkillChips
            skills={skills}
            value={tag}
            onChange={setTag}
          />
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

          {!loading && !error && projects.length === 0 && (
            <p className="text-sm text-muted-foreground glass rounded-2xl p-6">
              No projects match your filters.{" "}
              <Link href="/projects/new" className="text-primary hover:underline">
                Post a project
              </Link>
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((o) => (
              <article key={o.id} className="glass glass-hover rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/projects/${o.id}`}
                    className="font-semibold leading-snug hover:text-primary"
                  >
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
                  {o.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 rounded-md bg-white/5 border border-border text-muted-foreground"
                    >
                      {skillLabel(t, skills)}
                    </span>
                  ))}
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
