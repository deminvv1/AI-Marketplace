"use client";

/**
 * Визитка фрилансера: /freelancers/[username]
 * GET /api/freelancers/:username + учёт ProfileView на бэке.
 * Доступ только после регистрации (см. proxy.ts).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  getFreelancerByUsername,
  type FreelancerPublicProfile,
} from "@/app/actions/freelancers";
import { flag } from "@/lib/mock-data";
import { freelancerDisplayName } from "@/lib/projects";
import { Stars } from "@/components/ui-bits";
import { ArrowLeft, Loader2, MessageCircle, Eye } from "lucide-react";

export default function FreelancerProfilePage() {
  const params = useParams();
  const username = typeof params.username === "string" ? params.username : "";

  const [profile, setProfile] = useState<FreelancerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const result = await getFreelancerByUsername(username);
      if ("error" in result && result.error) setError(result.error);
      else if (result && "id" in result) setProfile(result as FreelancerPublicProfile);
      setLoading(false);
    })();
  }, [username]);

  if (loading) {
    return (
      <AppShell title="Freelancer">
        <div className="flex justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell title="Freelancer">
        <p className="text-destructive text-sm">{error ?? "Not found"}</p>
        <Link href="/freelancers" className="text-primary text-sm mt-4 inline-block">
          ← Back to catalog
        </Link>
      </AppShell>
    );
  }

  const p = profile.profile;
  const name = freelancerDisplayName({
    username: profile.username,
    profile: p,
  });
  const initial = name[0]?.toUpperCase() ?? "?";

  return (
    <AppShell title={name}>
      <Link
        href="/freelancers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="size-4" /> All freelancers
      </Link>

      <div className="rounded-3xl overflow-hidden glass">
        <div
          className="h-40 relative"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.4 0.25 295) 0%, oklch(0.4 0.22 265) 50%, oklch(0.45 0.18 215) 100%)",
          }}
        />
        <div className="p-6 pt-0 -mt-14 flex flex-wrap items-end gap-6">
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-28 rounded-2xl border-4 border-background object-cover"
              />
            ) : (
              <div className="size-28 rounded-2xl bg-gradient-primary border-4 border-background grid place-items-center text-4xl font-bold glow-primary">
                {initial}
              </div>
            )}
            {p?.onlineStatus && (
              <span className="absolute bottom-2 right-2 size-4 rounded-full bg-success border-4 border-background" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold">{name}</h1>
            {profile.username && (
              <p className="text-muted-foreground">@{profile.username}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Stars value={p?.rating ?? 0} />
                <span className="text-foreground font-medium">
                  {p?.rating?.toFixed(1) ?? "0"}
                </span>
                · {p?.reviewsCount ?? 0} reviews
              </span>
              {p?.country && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-border text-xs">
                  {flag(p.country)} {p.country}
                </span>
              )}
              {p?.viewCount != null && (
                <span className="inline-flex items-center gap-1 text-xs">
                  <Eye className="size-3.5" /> {p.viewCount} profile views
                </span>
              )}
            </div>
          </div>
          <Link
            href="/messages"
            className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium glow-primary inline-flex items-center gap-2"
          >
            <MessageCircle className="size-4" />
            Write
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {p?.bio && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-3">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {p.bio}
              </p>
            </section>
          )}

          {p?.specialization && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-2">Specialization</h2>
              <p className="text-sm">{p.specialization}</p>
              {p.industries?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.industries.map((ind) => (
                    <span
                      key={ind}
                      className="px-2 py-1 rounded-md bg-primary/15 text-primary border border-primary/30 text-xs"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {p?.experience && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-2">Experience</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{p.experience}</p>
            </section>
          )}

          {p?.portfolioItems && p.portfolioItems.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Portfolio</h2>
              <ul className="space-y-3">
                {p.portfolioItems.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 rounded-xl bg-white/5 border border-border"
                  >
                    <div className="font-medium text-sm">{item.title ?? item.type}</div>
                    {item.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                        {item.content}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-6 text-sm space-y-3">
            <h2 className="font-semibold">Stats</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed projects</span>
              <span className="font-medium">{p?.completedProjectsCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profile views</span>
              <span className="font-medium">{p?.viewCount ?? 0}</span>
            </div>
            {p?.language && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{p.language}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
