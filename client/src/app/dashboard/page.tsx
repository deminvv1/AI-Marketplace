"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app-shell";
import { WelcomeModal } from "@/components/welcome-modal";
import { flag } from "@/lib/countries";
import { getMe } from "@/app/actions/me";
import { getFavorites, type FavoriteFreelancer } from "@/app/actions/favorites";
import { getUnreadNotificationCount } from "@/app/actions/notifications";
import { getMyProposals, type ProposalItem } from "@/app/actions/proposals";
import { getMyProjects, type ProjectListItem } from "@/app/actions/projects";
import { freelancerDisplayName, projectStatusForUi } from "@/lib/projects";
import { normalizeRole } from "@/lib/roles";
import { useActiveMode } from "@/lib/use-active-mode";
import {
  ClipboardList, MessagesSquare, Bookmark, Inbox, Star, ArrowUpRight,
  MessageCircle, Send, BriefcaseBusiness, TrendingUp, Eye, Search,
} from "lucide-react";
import { StatusBadge } from "@/components/ui-bits";
import { EmptyState } from "@/components/empty-state";

// ── Client Dashboard ──────────────────────────────────────────────────────────
function ClientDashboard({
  displayName,
  myProjects,
  savedFreelancers,
  proposalCount,
  unreadNotifs,
}: {
  displayName: string;
  myProjects: ProjectListItem[];
  savedFreelancers: FavoriteFreelancer[];
  proposalCount: number;
  unreadNotifs: number;
}) {
  const t = useTranslations("dashboard");
  const activeCount = myProjects.filter(p => ["OPEN", "IN_PROGRESS"].includes(p.status)).length;
  const responsesCount = myProjects.reduce((sum, p) => sum + (p._count?.proposals ?? 0), 0);
  const savedOnline = savedFreelancers.filter(f => f.freelancer?.profile?.onlineStatus).length;

  const clientStats = [
    { label: t("activeProjects"),    value: String(activeCount),                     icon: ClipboardList,   color: "primary",    delta: "+1 this week" },
    { label: t("proposalsReceived"), value: String(responsesCount || proposalCount), icon: MessagesSquare,  color: "secondary",  delta: "+4 today" },
    { label: t("savedSpecialists"),  value: String(savedFreelancers.length),         icon: Bookmark,        color: "accent",     delta: savedFreelancers.length > 0 ? `${savedOnline} online` : t("fromFavorites") },
    { label: t("unreadMessages"),    value: String(unreadNotifs),                    icon: Inbox,           color: "primary",    delta: t("viewInbox") },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Welcome back, {displayName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link href="/projects/new" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition">{t("postProject")}<ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {clientStats.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="glass glass-hover rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className={`size-10 rounded-xl grid place-items-center border ${color === "primary" ? "bg-primary/15 border-primary/40" : color === "secondary" ? "bg-secondary/15 border-secondary/40" : "bg-accent/15 border-accent/40"}`}>
                <Icon className={`size-5 ${color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-accent"}`} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{delta}</span>
            </div>
            <div className="mt-5 text-3xl font-bold tracking-tight">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("recentProjects")}</h3>
            <Link href="/projects" className="text-xs text-primary hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="space-y-3">
            {myProjects.length === 0 ? (
              <EmptyState icon={ClipboardList} title={t("noProjects")} description={t("noProjectsHint")} action={{ label: t("postProject"), href: "/projects/new" }} />
            ) : (
              myProjects.slice(0, 3).map(o => (
                <Link key={o.id} href={`/projects/${o.id}`} className="block p-4 rounded-xl bg-muted/60 border border-border hover:border-primary/40 hover:bg-primary/5 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{o.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                        {o.industry && <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">{o.industry}</span>}
                        <span className="text-muted-foreground">{o.budget || t("budgetTbd")}</span>
                        {o.country && <span className="text-muted-foreground">· {flag(o.country)} {o.country}</span>}
                      </div>
                    </div>
                    <StatusBadge status={projectStatusForUi(o.status)} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("savedSpecialists")}</h3>
            <Link href="/saved" className="text-xs text-primary hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {savedFreelancers.length === 0 ? (
              <EmptyState icon={Bookmark} title={t("noSaved")} description={t("noSavedHint")} action={{ label: t("browseSpecialists"), href: "/specialists" }} />
            ) : (
              savedFreelancers.map(f => {
                const u = f.freelancer;
                if (!u) return null;
                const name = freelancerDisplayName({ username: u.username, profile: u.profile });
                const profileHref = u.username ? `/specialists/${u.username}` : "/specialists";
                return (
                  <div key={f.id} className="p-3 rounded-xl bg-muted/60 border border-border hover:border-primary/40 transition flex items-center gap-3">
                    <div className="relative">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
                        : <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">{(name[0] ?? "?").toUpperCase()}</div>
                      }
                      {u.profile?.onlineStatus && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={profileHref} className="text-sm font-medium truncate block hover:text-primary">{name}</Link>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="size-3 fill-warning text-warning" /> {u.profile?.rating?.toFixed(1) ?? "—"} · {u.profile?.specialization ?? t("specialist")}
                      </div>
                    </div>
                    <Link href="/messages" className="size-8 grid place-items-center rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition">
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
  );
}

// ── Specialist Dashboard ──────────────────────────────────────────────────────
function SpecialistDashboard({
  displayName,
  proposals,
  unreadNotifs,
}: {
  displayName: string;
  proposals: ProposalItem[];
  unreadNotifs: number;
}) {
  const t = useTranslations("dashboard");
  const activeProposals  = proposals.filter(p => p.status === "PENDING").length;
  const acceptedProposals = proposals.filter(p => p.status === "ACCEPTED").length;
  const totalProposals   = proposals.length;

  const specialistStats = [
    { label: t("activeProposals"),  value: String(activeProposals),   icon: Send,             color: "primary",   delta: t("awaitingResponse") },
    { label: t("accepted"),          value: String(acceptedProposals), icon: BriefcaseBusiness, color: "secondary", delta: t("projectsWon") },
    { label: t("totalSent"),        value: String(totalProposals),    icon: TrendingUp,        color: "accent",    delta: t("allTime") },
    { label: t("unreadMessages"),   value: String(unreadNotifs),      icon: Inbox,             color: "primary",   delta: t("viewInbox") },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Welcome back, {displayName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg border border-border text-sm font-medium hover:bg-muted/60 transition">
            <Eye className="size-4" />{t("myProfile")}</Link>
          <Link href="/specialists" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-white text-sm font-medium glow-primary hover:opacity-90 transition">
            <Search className="size-4" />{t("findProjects")}</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {specialistStats.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="glass glass-hover rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className={`size-10 rounded-xl grid place-items-center border ${color === "primary" ? "bg-primary/15 border-primary/40" : color === "secondary" ? "bg-secondary/15 border-secondary/40" : "bg-accent/15 border-accent/40"}`}>
                <Icon className={`size-5 ${color === "primary" ? "text-primary" : color === "secondary" ? "text-secondary" : "text-accent"}`} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{delta}</span>
            </div>
            <div className="mt-5 text-3xl font-bold tracking-tight">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Proposals */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("myProposals")}</h3>
            <Link href="/proposals" className="text-xs text-primary hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="space-y-3">
            {proposals.length === 0 ? (
              <EmptyState icon={Send} title={t("noProposals")} description={t("noProposalsHint")} action={{ label: t("browseProjects"), href: "/projects" }} />
            ) : (
              proposals.slice(0, 5).map(p => {
                const proj = p.project;
                if (!proj) return null;
                const statusColor: Record<string, string> = {
                  PENDING: "text-warning", ACCEPTED: "text-success", REJECTED: "text-destructive",
                };
                return (
                  <Link key={p.id} href={`/projects/${p.projectId}`} className="block p-4 rounded-xl bg-muted/60 border border-border hover:border-primary/40 hover:bg-primary/5 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{proj.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                          {proj.industry && <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary border border-primary/30">{proj.industry}</span>}
                          {p.proposedBudget && <span className="text-muted-foreground">{p.proposedBudget}</span>}
                          {p.estimatedDays && <span className="text-muted-foreground">· {p.estimatedDays}d</span>}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${statusColor[p.status] ?? "text-muted-foreground"}`}>
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">{t("quickActions")}</h3>
          <div className="space-y-3">
            {[
              { href: "/projects",   icon: ClipboardList,   label: t("browseOpenProjects"),  desc: t("findWorkMatching") },
              { href: "/profile",    icon: Eye,             label: t("updateProfile"),         desc: t("keepPortfolioFresh") },
              { href: "/messages",   icon: MessageCircle,   label: t("messages"),               desc: `${unreadNotifs > 0 ? `${unreadNotifs} unread` : t("allCaughtUp")}` },
              { href: "/solutions",  icon: TrendingUp,      label: t("mySolutions"),           desc: t("manageListings") },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border border-border hover:border-primary/40 hover:bg-primary/5 transition group">
                <div className="size-9 rounded-lg bg-primary/10 border border-primary/25 grid place-items-center shrink-0 group-hover:bg-primary/20 transition">
                  <Icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard (role-aware) ───────────────────────────────────────────────
export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [displayName, setDisplayName] = useState("there");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [myProjects, setMyProjects] = useState<ProjectListItem[]>([]);
  const [savedFreelancers, setSavedFreelancers] = useState<FavoriteFreelancer[]>([]);
  const [myProposals, setMyProposals] = useState<ProposalItem[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  const { mode } = useActiveMode(userRole ?? undefined);

  useEffect(() => {
    (async () => {
      const me = await getMe();
      if (me?.profile?.firstName) setDisplayName(me.profile.firstName);
      else if (me?.username) setDisplayName(me.username);
      setUserRole(me?.role ?? null);

      const [mine, favs, notifs, proposals] = await Promise.all([
        getMyProjects(),
        getFavorites("freelancer"),
        getUnreadNotificationCount(),
        getMyProposals(),
      ]);
      if (Array.isArray(mine)) setMyProjects(mine);
      if (Array.isArray(favs)) setSavedFreelancers(favs);
      setUnreadNotifs(notifs.count ?? 0);
      if (Array.isArray(proposals)) setMyProposals(proposals);
      setLoading(false);
    })();
  }, []);

  // Determine which dashboard to show
  const role = normalizeRole(userRole);
  const isSpecialist = role === "FREELANCER" || (role === "BOTH" && mode === "FREELANCER");

  return (
    <AppShell title={t("title")}>
      <WelcomeModal />
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="size-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      ) : isSpecialist ? (
        <SpecialistDashboard
          displayName={displayName}
          proposals={myProposals}
          unreadNotifs={unreadNotifs}
        />
      ) : (
        <ClientDashboard
          displayName={displayName}
          myProjects={myProjects}
          savedFreelancers={savedFreelancers}
          proposalCount={myProposals.length}
          unreadNotifs={unreadNotifs}
        />
      )}
    </AppShell>
  );
}
