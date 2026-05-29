"use client";

/** Дашборд заказчика: имя из getMe(), проекты из GET /api/projects/mine */

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { WelcomeModal } from "@/components/welcome-modal";
import { flag } from "@/lib/mock-data";
import { getMe } from "@/app/actions/me";
import { getFavorites, type FavoriteFreelancer } from "@/app/actions/favorites";
import { getMyProjects, type ProjectListItem } from "@/app/actions/projects";
import { freelancerDisplayName } from "@/lib/projects";
import { projectStatusForUi } from "@/lib/projects";
import {
  ClipboardList,
  MessagesSquare,
  Bookmark,
  Inbox,
  Star,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui-bits";

const stats = [
  {
    label: "Active Projects",
    value: "3",
    icon: ClipboardList,
    color: "primary",
    delta: "+1 this week",
  },
  {
    label: "Responses Received",
    value: "12",
    icon: MessagesSquare,
    color: "secondary",
    delta: "+4 today",
  },
  { label: "Saved Freelancers", value: "0", icon: Bookmark, color: "accent", delta: "From favorites" },
  { label: "Unread Messages", value: "5", icon: Inbox, color: "primary", delta: "View inbox" },
] as const;

export default function DashboardPage() {
  const [displayName, setDisplayName] = useState("there");
  const [myProjects, setMyProjects] = useState<ProjectListItem[]>([]);
  const [savedFreelancers, setSavedFreelancers] = useState<FavoriteFreelancer[]>([]);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me?.profile?.firstName) {
        setDisplayName(me.profile.firstName);
      } else if (me?.username) {
        setDisplayName(me.username);
      }

      const [mine, favs] = await Promise.all([
        getMyProjects(),
        getFavorites("freelancer"),
      ]);
      if (Array.isArray(mine)) setMyProjects(mine);
      if (Array.isArray(favs)) setSavedFreelancers(favs);
    })();
  }, []);

  const activeCount = myProjects.filter((p) =>
    ["OPEN", "IN_PROGRESS"].includes(p.status),
  ).length;

  const savedOnline = savedFreelancers.filter(
    (f) => f.freelancer?.profile?.onlineStatus,
  ).length;

  return (
    <AppShell title="Dashboard">
      <WelcomeModal />
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, {displayName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Wednesday · May 27, 2026 · 3 active conversations
            </p>
          </div>
          <Link
            href="/projects/new"
            className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition"
          >
            Post a project <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {/* Сетка со статистикой */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, delta }, idx) => (
            <div key={label} className="glass glass-hover rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`size-10 rounded-xl grid place-items-center border ${color === "primary" ? "bg-primary/15 border-primary/40" : color === "secondary" ? "bg-secondary/15 border-secondary/40" : "bg-accent/15 border-accent/40"}`}
                >
                  <Icon
                    className={`size-5 ${color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-accent"}`}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {idx === 2 && savedFreelancers.length > 0
                    ? `${savedOnline} online`
                    : delta}
                </span>
              </div>
              <div className="mt-5 text-3xl font-bold tracking-tight">
                {idx === 0
                  ? String(activeCount || value)
                  : idx === 2
                    ? String(savedFreelancers.length)
                    : value}
              </div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Секция с заказами и исполнителями */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Недавние заказы */}
          <div className="lg:col-span-2 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">My Recent Projects</h3>
              <Link href="/projects" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {myProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects yet.{" "}
                  <Link href="/projects/new" className="text-primary hover:underline">
                    Post your first project
                  </Link>
                  .
                </p>
              ) : (
                myProjects.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="p-4 rounded-xl bg-white/5 border border-border hover:border-primary/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{o.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {o.industry && (
                            <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">
                              {o.industry}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            {o.budget || "Budget TBD"}
                          </span>
                          {o.country && (
                            <span className="text-muted-foreground">
                              · {flag(o.country)} {o.country}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={projectStatusForUi(o.status)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Сохранённые фрилансеры */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Saved Freelancers</h3>
              <Link href="/freelancers" className="text-xs text-primary hover:underline">
                Browse catalog
              </Link>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {savedFreelancers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Save freelancers from their profile page to see them here.
                </p>
              ) : (
                savedFreelancers.map((f) => {
                  const u = f.freelancer;
                  if (!u) return null;
                  const name = freelancerDisplayName({
                    username: u.username,
                    profile: u.profile,
                  });
                  const initial = name[0]?.toUpperCase() ?? "?";
                  const profileHref = u.username
                    ? `/freelancers/${u.username}`
                    : "/freelancers";
                  return (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-white/5 border border-border hover:border-primary/40 transition flex items-center gap-3"
                    >
                      <div className="relative">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">
                            {initial}
                          </div>
                        )}
                        {u.profile?.onlineStatus && (
                          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={profileHref}
                          className="text-sm font-medium truncate block hover:text-primary"
                        >
                          {name}
                        </Link>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="size-3 fill-warning text-warning" />{" "}
                          {u.profile?.rating?.toFixed(1) ?? "—"} ·{" "}
                          {u.profile?.specialization ?? "Freelancer"}
                        </div>
                      </div>
                      <Link
                        href="/messages"
                        className="size-8 grid place-items-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition"
                      >
                        <MessageCircle className="size-4" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
