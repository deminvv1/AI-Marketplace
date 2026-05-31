"use client";

/**
 * Каталог фрилансеров: GET /api/freelancers
 * Карточка ведёт на визитку /freelancers/[username]
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { listFreelancers, type FreelancerListItem } from "@/app/actions/freelancers";
import { flag } from "@/lib/mock-data";
import { freelancerDisplayName } from "@/lib/projects";
import { Stars } from "@/components/ui-bits";
import { Loader2, ArrowRight } from "lucide-react";

export default function FreelancersCatalogPage() {
  const [items, setItems] = useState<FreelancerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await listFreelancers();
      if ("error" in result && result.error) setError(result.error);
      else if (Array.isArray(result)) setItems(result);
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell title="Freelancers">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Find AI specialists</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Profiles visible to registered users · click to open a full page
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-muted-foreground glass rounded-2xl p-6">
          No freelancer profiles yet. Complete onboarding as FREELANCER and set a username.
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((u) => {
          const slug = u.username;
          if (!slug) return null;
          const name = freelancerDisplayName({
            username: u.username,
            profile: u.profile,
          });
          return (
            <Link
              key={u.id}
              href={`/freelancers/${slug}`}
              className="glass glass-hover rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gradient-primary grid place-items-center text-lg font-semibold shrink-0">
                  {name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{name}</div>
                  <div className="text-xs text-muted-foreground">@{slug}</div>
                </div>
                {u.profile?.onlineStatus && (
                  <span className="ml-auto size-2.5 rounded-full bg-success" title="Online" />
                )}
              </div>
              {u.profile?.specialization && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {u.profile.specialization}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
                <span className="flex items-center gap-1">
                  <Stars value={u.profile?.rating ?? 0} />
                  {u.profile?.rating?.toFixed(1) ?? "—"} · {u.profile?.reviewsCount ?? 0} reviews
                </span>
                {u.profile?.country && (
                  <span>
                    {flag(u.profile.country)} {u.profile.country}
                  </span>
                )}
              </div>
              <span className="text-xs text-primary inline-flex items-center gap-1">
                View profile <ArrowRight className="size-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
