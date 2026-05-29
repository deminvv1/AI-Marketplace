"use client";

/**
 * Каталог Solution: GET /api/solutions?industry=&format=&q=
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  CatalogIndustryChips,
  CatalogSkillChips,
} from "@/components/catalog-taxonomy-filters";
import { getSolutions, type SolutionListItem } from "@/app/actions/solutions";
import { useTaxonomy } from "@/lib/use-taxonomy";
import { skillLabel } from "@/lib/taxonomy";
import { solutionAuthorName, SOLUTION_FORMATS } from "@/lib/solutions";
import { Stars } from "@/components/ui-bits";
import { Loader2, Plus, Search } from "lucide-react";

const gradients = [
  "linear-gradient(135deg,#1e293b,#6366f1)",
  "linear-gradient(135deg,#312e81,#06b6d4)",
  "linear-gradient(135deg,#4c1d95,#ec4899)",
  "linear-gradient(135deg,#064e3b,#10b981)",
  "linear-gradient(135deg,#1f2937,#f59e0b)",
  "linear-gradient(135deg,#831843,#6366f1)",
];

export default function SolutionsPage() {
  const [items, setItems] = useState<SolutionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { categories, skills } = useTaxonomy();
  const [industry, setIndustry] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await getSolutions({
        industry: industry ?? undefined,
        tag: tag ?? undefined,
        format: format ?? undefined,
        q: query.trim() || undefined,
      });
      if (cancelled) return;
      if ("error" in result && result.error) {
        setError(result.error);
        setItems([]);
      } else if (Array.isArray(result)) {
        setItems(result);
      }
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, industry, tag, format]);

  return (
    <AppShell title="Solutions">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Solutions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${items.length} published solution${items.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/solutions/new"
          className="h-9 px-4 rounded-lg bg-gradient-primary text-white text-xs font-medium glow-primary inline-flex items-center gap-2"
        >
          <Plus className="size-4" /> Publish solution
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search solutions…"
          className="w-full h-11 pl-10 pr-3 rounded-xl glass border border-border text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFormat(null)}
          className={`h-8 px-3 rounded-lg text-xs border ${!format ? "border-primary/50 text-primary bg-primary/10" : "border-border"}`}
        >
          All formats
        </button>
        {SOLUTION_FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`h-8 px-3 rounded-lg text-xs border ${format === f ? "border-primary/50 text-primary bg-primary/10" : "border-border"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="mb-4">
          <CatalogIndustryChips
            categories={categories}
            value={industry}
            onChange={setIndustry}
          />
        </div>
      )}

      <CatalogSkillChips
        skills={skills}
        value={tag}
        onChange={setTag}
        className="mb-8"
      />

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-muted-foreground glass rounded-2xl p-6 text-center">
          No solutions yet.{" "}
          <Link href="/solutions/new" className="text-primary hover:underline">
            Publish the first one
          </Link>
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((o, i) => (
          <Link key={o.id} href={`/solutions/${o.id}`} className="glass glass-hover rounded-2xl overflow-hidden flex flex-col">
            <div className="h-40 relative" style={{ background: gradients[i % gradients.length] }}>
              {o.format && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/30 backdrop-blur text-[10px] uppercase tracking-widest text-white border border-white/20">
                  {o.format}
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1">
              <h4 className="font-semibold leading-snug">{o.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {o.preview || o.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {o.industry && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30 text-xs">
                    {o.industry}
                  </span>
                )}
                {o.tags?.slice(0, 3).map((slug) => (
                  <span
                    key={slug}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-border text-xs text-muted-foreground"
                  >
                    {skillLabel(slug, skills)}
                  </span>
                ))}
              </div>
              <div className="text-base font-bold mt-auto pt-3 border-t border-border">
                {o.price || "Price on request"}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold">
                  {solutionAuthorName(o.freelancer)[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{solutionAuthorName(o.freelancer)}</div>
                  {(o.freelancer.profile?.rating ?? 0) > 0 && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Stars value={o.freelancer.profile!.rating} />
                      {o.freelancer.profile!.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
