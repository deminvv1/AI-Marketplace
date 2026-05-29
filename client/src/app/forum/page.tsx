"use client";

/**
 * Лента форума: GET /api/forum/posts?industry=&q=
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { flag } from "@/lib/mock-data";
import {
  CatalogIndustryList,
  CatalogSkillChips,
} from "@/components/catalog-taxonomy-filters";
import { getForumPosts, type ForumPostListItem } from "@/app/actions/forum";
import { useTaxonomy } from "@/lib/use-taxonomy";
import { skillLabel } from "@/lib/taxonomy";
import { forumAuthorName, formatForumTime } from "@/lib/forum";
import { Loader2, MessageSquare, Plus, Search, ThumbsUp } from "lucide-react";

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { categories, skills } = useTaxonomy();
  const [industry, setIndustry] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await getForumPosts({
        industry: industry ?? undefined,
        tag: tag ?? undefined,
        q: query.trim() || undefined,
      });
      if (cancelled) return;
      if ("error" in result && result.error) {
        setError(result.error);
        setPosts([]);
      } else if (Array.isArray(result)) {
        setPosts(result);
      }
      setLoading(false);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, industry, tag]);

  return (
    <AppShell title="Forum">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3 glass rounded-2xl p-5 h-fit space-y-6">
          {categories.length > 0 && (
            <CatalogIndustryList
              categories={categories}
              value={industry}
              onChange={setIndustry}
              title="Categories"
              allLabel="All topics"
            />
          )}
          <CatalogSkillChips skills={skills} value={tag} onChange={setTag} />
        </aside>

        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/forum/new"
              className="h-10 px-4 rounded-xl bg-secondary text-white text-sm font-medium glow-secondary inline-flex items-center gap-2"
            >
              <Plus className="size-4" /> New topic
            </Link>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search threads…"
                className="w-full h-10 pl-9 pr-3 rounded-xl glass border border-border text-sm"
              />
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && !error && posts.length === 0 && (
            <p className="text-sm text-muted-foreground glass rounded-2xl p-6 text-center">
              No topics yet.{" "}
              <Link href="/forum/new" className="text-primary hover:underline">
                Start the first discussion
              </Link>
            </p>
          )}

          {posts.map((t) => (
            <Link
              key={t.id}
              href={`/forum/${t.id}`}
              className="block glass glass-hover rounded-2xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold shrink-0">
                  {forumAuthorName(t.author)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">
                      {forumAuthorName(t.author)}
                    </span>
                    {t.author.profile?.country && (
                      <>
                        <span>·</span>
                        <span>
                          {flag(t.author.profile.country)} {t.author.profile.country}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatForumTime(t.createdAt)}</span>
                    {t.isPinned && (
                      <span className="text-primary font-medium">Pinned</span>
                    )}
                  </div>
                  <h4 className="mt-2 font-semibold leading-snug">{t.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.industry && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30 text-xs">
                        {t.industry}
                      </span>
                    )}
                    {t.tags?.slice(0, 4).map((slug) => (
                      <span
                        key={slug}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-border text-xs text-muted-foreground"
                      >
                        {skillLabel(slug, skills)}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {t.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="size-3.5" /> {t.likesCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3.5" /> {t._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
