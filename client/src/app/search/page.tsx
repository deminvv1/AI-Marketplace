"use client";

/**
 * Глобальный поиск — см. docs/SEARCH.md
 */

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  searchMarketplace,
  type SearchFilters,
  type SearchTab,
} from "@/app/actions/search";
import { CatalogIndustryChips, CatalogSkillChips } from "@/components/catalog-taxonomy-filters";
import { freelancerDisplayName } from "@/lib/projects";
import { forumAuthorName } from "@/lib/forum";
import { useTaxonomy } from "@/lib/use-taxonomy";
import { Search, Loader2, ArrowRight } from "lucide-react";

const TABS: { key: SearchTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "projects", label: "Projects" },
  { key: "freelancers", label: "Freelancers" },
  { key: "solutions", label: "Solutions" },
  { key: "forum", label: "Forum" },
];

const PREVIEW = 5;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialTag = searchParams.get("tag");
  const initialIndustry = searchParams.get("industry");
  const initialTab = (searchParams.get("tab") as SearchTab) || "all";
  const { categories, skills } = useTaxonomy();

  const [query, setQuery] = useState(initialQ);
  const [tag, setTag] = useState<string | null>(initialTag);
  const [industry, setIndustry] = useState<string | null>(initialIndustry);
  const [tab, setTab] = useState<SearchTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchMarketplace>> | null>(null);

  const filters: SearchFilters = {
    ...(query.trim() ? { q: query.trim() } : {}),
    ...(tag ? { tag } : {}),
    ...(industry ? { industry } : {}),
  };

  const hasFilters = !!(filters.q || filters.tag || filters.industry);

  useEffect(() => {
    setQuery(initialQ);
    setTag(initialTag);
    setIndustry(initialIndustry);
    setTab(initialTab);
  }, [initialQ, initialTag, initialIndustry, initialTab]);

  useEffect(() => {
    if (!hasFilters) {
      setResults(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await searchMarketplace(filters);
      if (!cancelled) {
        setResults(data);
        setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, tag, industry, hasFilters]);

  function applyUrl(
    nextQ: string,
    nextTab: SearchTab,
    nextTag: string | null,
    nextIndustry: string | null,
  ) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextTag) params.set("tag", nextTag);
    if (nextIndustry) params.set("industry", nextIndustry);
    if (nextTab !== "all") params.set("tab", nextTab);
    const qs = params.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    applyUrl(query, tab, tag, industry);
  }

  const r = results ?? {
    projects: [],
    freelancers: [],
    solutions: [],
    forum: [],
  };

  const showProjects = tab === "all" || tab === "projects";
  const showFreelancers = tab === "all" || tab === "freelancers";
  const showSolutions = tab === "all" || tab === "solutions";
  const showForum = tab === "all" || tab === "forum";
  const limit = tab === "all" ? PREVIEW : 50;

  const total =
    r.projects.length +
    r.freelancers.length +
    r.solutions.length +
    r.forum.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={submitSearch} className="relative">
        <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects, freelancers, solutions, forum…"
          className="w-full h-12 pl-12 pr-28 rounded-2xl bg-white/5 border border-border text-base focus:outline-none focus:border-primary"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium"
        >
          Search
        </button>
      </form>

      <CatalogIndustryChips
        categories={categories}
        value={industry}
        onChange={(v) => {
          setIndustry(v);
          applyUrl(query, tab, tag, v);
        }}
      />

      <CatalogSkillChips
        skills={skills}
        value={tag}
        onChange={(v) => {
          setTag(v);
          applyUrl(query, tab, v, industry);
        }}
        className="mt-2"
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              applyUrl(query, t.key, tag, industry);
            }}
            className={`h-8 px-3 rounded-lg text-sm border transition ${
              tab === t.key
                ? "bg-primary/15 border-primary/50 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hasFilters && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Enter a keyword or pick a skill / industry to search the marketplace.
        </p>
      )}

      {hasFilters && loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {hasFilters && !loading && total === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Nothing found{query.trim() ? ` for “${query}”` : ""}
          {tag ? ` with skill “${tag}”` : ""}
          {industry ? ` in ${industry}` : ""}.
        </p>
      )}

      {hasFilters && !loading && showProjects && r.projects.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Projects"
            count={r.projects.length}
            showLink={tab === "all"}
            onViewAll={() => {
              setTab("projects");
              applyUrl(query, "projects", tag, industry);
            }}
          />
          {r.projects.slice(0, limit).map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block glass rounded-xl p-4 hover:border-primary/40 border border-transparent transition"
            >
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {p.industry ?? "—"} · {p.budget || "Budget TBD"}
              </div>
            </Link>
          ))}
        </section>
      )}

      {hasFilters && !loading && showFreelancers && r.freelancers.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Freelancers"
            count={r.freelancers.length}
            showLink={tab === "all"}
            onViewAll={() => {
              setTab("freelancers");
              applyUrl(query, "freelancers", tag, industry);
            }}
          />
          {r.freelancers.slice(0, limit).map((u) => (
            <Link
              key={u.id}
              href={u.username ? `/freelancers/${u.username}` : "/freelancers"}
              className="block glass rounded-xl p-4 hover:border-primary/40 border border-transparent transition"
            >
              <div className="font-medium">
                {freelancerDisplayName({ username: u.username, profile: u.profile })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {u.profile?.specialization ?? "Freelancer"} · ★{" "}
                {u.profile?.rating?.toFixed(1) ?? "—"}
              </div>
            </Link>
          ))}
        </section>
      )}

      {hasFilters && !loading && showSolutions && r.solutions.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Solutions"
            count={r.solutions.length}
            showLink={tab === "all"}
            onViewAll={() => {
              setTab("solutions");
              applyUrl(query, "solutions", tag, industry);
            }}
          />
          {r.solutions.slice(0, limit).map((s) => (
            <Link
              key={s.id}
              href={`/solutions/${s.id}`}
              className="block glass rounded-xl p-4 hover:border-primary/40 border border-transparent transition"
            >
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {s.industry ?? "—"} · {s.price || "Price on request"}
              </div>
            </Link>
          ))}
        </section>
      )}

      {hasFilters && !loading && showForum && r.forum.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Forum"
            count={r.forum.length}
            showLink={tab === "all"}
            onViewAll={() => {
              setTab("forum");
              applyUrl(query, "forum", tag, industry);
            }}
          />
          {r.forum.slice(0, limit).map((t) => (
            <Link
              key={t.id}
              href={`/forum/${t.id}`}
              className="block glass rounded-xl p-4 hover:border-primary/40 border border-transparent transition"
            >
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {forumAuthorName(t.author)} · {t._count.comments} comments
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  count,
  showLink,
  onViewAll,
}: {
  title: string;
  count: number;
  showLink: boolean;
  onViewAll: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">
        {title}{" "}
        <span className="text-muted-foreground font-normal text-sm">({count})</span>
      </h3>
      {showLink && count > PREVIEW && (
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell title="Search">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </AppShell>
  );
}
