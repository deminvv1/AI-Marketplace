"use client";

/**
 * Избранное: freelancers, projects, solutions — GET /api/favorites
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { getFavorites, type FavoriteItem } from "@/app/actions/favorites";
import { freelancerDisplayName } from "@/lib/projects";
import { Bookmark, Loader2, Star } from "lucide-react";

type Tab = "all" | "freelancer" | "project" | "solution";

/** Label is a translation key — t() is not available at module level. */
const TABS: { key: Tab; labelKey: string }[] = [
  { key: "all", labelKey: "all" },
  { key: "freelancer", labelKey: "specialists" },
  { key: "project", labelKey: "projects" },
  { key: "solution", labelKey: "solutions" },
];

export default function SavedPage() {
  const t = useTranslations("saved");
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getFavorites();
      if ("error" in res && res.error) setError(res.error);
      else if (Array.isArray(res)) setItems(res);
      setLoading(false);
    })();
  }, []);

  const filtered =
    tab === "all" ? items : items.filter((i) => i.targetType === tab);

  return (
    <AppShell title={t("title")}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-accent/15 border border-accent/30 grid place-items-center">
            <Bookmark className="size-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`h-8 px-3 rounded-lg text-sm border ${
                tab === tabItem.key
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground glass rounded-2xl p-8 text-center">
            {t("empty")}
          </p>
        )}

        <ul className="space-y-3">
          {filtered.map((f) => (
            <li key={f.id}>
              <SavedRow item={f} />
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function SavedRow({ item }: { item: FavoriteItem }) {
  const t = useTranslations("saved");
  if (item.targetType === "freelancer" && item.freelancer) {
    const u = item.freelancer;
    const name = freelancerDisplayName({
      username: u.username,
      profile: u.profile,
    });
    const href = u.username ? `/specialists/${u.username}` : "/specialists";
    return (
      <Link
        href={href}
        className="block glass rounded-xl p-4 hover:border-primary/40 transition"
      >
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {t("specialist")}
        </div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Star className="size-3 fill-warning text-warning" />
          {u.profile?.rating?.toFixed(1) ?? "—"} · {u.profile?.specialization ?? "—"}
        </div>
      </Link>
    );
  }

  if (item.targetType === "project" && item.project) {
    const p = item.project;
    return (
      <Link
        href={`/projects/${p.id}`}
        className="block glass rounded-xl p-4 hover:border-primary/40 transition"
      >
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {t("project")}
        </div>
        <div className="font-medium">{p.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {p.industry ?? "—"} · {p.budget || "TBD"} · {p.status}
        </div>
      </Link>
    );
  }

  if (item.targetType === "solution" && item.solution) {
    const s = item.solution;
    return (
      <Link
        href={`/solutions/${s.id}`}
        className="block glass rounded-xl p-4 hover:border-primary/40 transition"
      >
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {t("solution")}
        </div>
        <div className="font-medium">{s.title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {s.industry ?? "—"} · {s.price || t("onRequest")}
        </div>
      </Link>
    );
  }

  return (
    <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
      {item.targetType} (unavailable)
    </div>
  );
}
