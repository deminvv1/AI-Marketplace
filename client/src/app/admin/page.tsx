"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  adminGetStats, adminListUsers, adminBanUser, adminUnbanUser,
  adminListReports,
  type AdminStats, type AdminUserItem, type AdminReport,
} from "@/app/actions/admin";
import {
  Users, ShieldBan, ShieldCheck, Loader2, Search,
  ClipboardList, ShoppingBag, MessagesSquare, Send, Flag, AlertTriangle,
} from "lucide-react";

type Tab = "stats" | "users" | "reports";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersQ, setUsersQ] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [banBusy, setBanBusy] = useState<string | null>(null);

  // Reports
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    adminGetStats().then((r) => {
      if ("error" in r) setStatsError(r.error);
      else setStats(r);
    });
  }, []);

  // Load users
  const loadUsers = useCallback(async (q: string, page: number) => {
    setUsersLoading(true);
    setUsersError(null);
    const r = await adminListUsers(q || undefined, page);
    setUsersLoading(false);
    if ("error" in r) { setUsersError(r.error); return; }
    setUsers(r.items);
    setUsersTotal(r.total);
  }, []);

  useEffect(() => {
    if (tab === "users") loadUsers(usersQ, usersPage);
  }, [tab, usersPage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load reports
  const loadReports = useCallback(async (page: number) => {
    setReportsLoading(true);
    setReportsError(null);
    const r = await adminListReports(page);
    setReportsLoading(false);
    if ("error" in r) { setReportsError(r.error); return; }
    setReports(r.items);
    setReportsTotal(r.total);
  }, []);

  useEffect(() => {
    if (tab === "reports") loadReports(reportsPage);
  }, [tab, reportsPage]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBan(user: AdminUserItem) {
    setBanBusy(user.id);
    const r = user.isBlocked
      ? await adminUnbanUser(user.id)
      : await adminBanUser(user.id);
    setBanBusy(null);
    if ("error" in r) return;
    setUsers((prev) =>
      prev.map((u) => u.id === user.id ? { ...u, isBlocked: r.isBlocked } : u),
    );
  }

  const totalUsersPages = Math.ceil(usersTotal / 20);
  const totalReportsPages = Math.ceil(reportsTotal / 20);

  return (
    <AppShell title="Admin Panel">
      {/* Access denied for non-admins is handled by the API returning 403 */}
      <div className="space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 w-fit">
          {(["stats", "users", "reports"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t
                  ? "bg-primary/20 text-foreground border border-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === "stats" && (
          <>
            {statsError && (
              <div className="glass rounded-2xl p-6 flex items-center gap-3 text-destructive">
                <AlertTriangle className="size-5 shrink-0" />
                <span className="text-sm">{statsError === "403" ? "Access denied — Admin role required." : statsError}</span>
              </div>
            )}
            {!stats && !statsError && (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total users",    value: stats.users,      icon: Users,          color: "text-primary" },
                  { label: "Blocked users",  value: stats.blocked,    icon: ShieldBan,      color: "text-destructive" },
                  { label: "Projects",       value: stats.projects,   icon: ClipboardList,  color: "text-blue-400" },
                  { label: "Solutions",      value: stats.solutions,  icon: ShoppingBag,    color: "text-green-400" },
                  { label: "Forum posts",    value: stats.forumPosts, icon: MessagesSquare, color: "text-yellow-400" },
                  { label: "Proposals",      value: stats.proposals,  icon: Send,           color: "text-purple-400" },
                  { label: "Reports",        value: stats.reports,    icon: Flag,           color: "text-orange-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4">
                    <div className={`size-10 rounded-xl bg-white/5 border border-border grid place-items-center ${color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUsersPage(1);
                loadUsers(usersQ, 1);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1 max-w-sm">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={usersQ}
                  onChange={(e) => setUsersQ(e.target.value)}
                  placeholder="Search by email or username…"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm"
              >
                Search
              </button>
            </form>

            {usersError && <p className="text-sm text-destructive">{usersError}</p>}

            {usersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 px-4 py-2 border-b border-border text-xs text-muted-foreground font-medium">
                  <span>User</span>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Joined</span>
                  <span>Action</span>
                </div>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-4 py-8 text-center">No users found.</p>
                ) : (
                  users.map((u) => {
                    const name = [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || u.username || "—";
                    return (
                      <div
                        key={u.id}
                        className={`grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3 border-b border-border/50 last:border-0 text-sm ${
                          u.isBlocked ? "opacity-60" : ""
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold shrink-0">
                            {name[0]?.toUpperCase()}
                          </div>
                          <span className="truncate">{name}</span>
                          {u.isBlocked && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30 shrink-0">
                              banned
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground truncate text-xs">{u.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${
                          u.role === "ADMIN"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : u.role === "FREELANCER"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-white/5 text-muted-foreground border-border"
                        }`}>
                          {u.role}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          disabled={banBusy === u.id || u.role === "ADMIN"}
                          onClick={() => handleBan(u)}
                          className={`h-8 px-3 rounded-lg text-xs inline-flex items-center gap-1.5 transition disabled:opacity-40 ${
                            u.isBlocked
                              ? "border border-green-500/40 text-green-400 hover:bg-green-500/10"
                              : "border border-destructive/40 text-destructive hover:bg-destructive/10"
                          }`}
                          title={u.role === "ADMIN" ? "Cannot ban admin" : ""}
                        >
                          {banBusy === u.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : u.isBlocked ? (
                            <ShieldCheck className="size-3" />
                          ) : (
                            <ShieldBan className="size-3" />
                          )}
                          {u.isBlocked ? "Unban" : "Ban"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Pagination */}
            {totalUsersPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{usersTotal} users total</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={usersPage === 1}
                    onClick={() => setUsersPage((p) => p - 1)}
                    className="h-8 px-3 rounded-lg border border-border text-xs disabled:opacity-40 hover:border-primary/40"
                  >
                    Previous
                  </button>
                  <span className="h-8 px-3 grid place-items-center text-xs text-muted-foreground">
                    {usersPage} / {totalUsersPages}
                  </span>
                  <button
                    type="button"
                    disabled={usersPage >= totalUsersPages}
                    onClick={() => setUsersPage((p) => p + 1)}
                    className="h-8 px-3 rounded-lg border border-border text-xs disabled:opacity-40 hover:border-primary/40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports tab */}
        {tab === "reports" && (
          <div className="space-y-4">
            {reportsError && <p className="text-sm text-destructive">{reportsError}</p>}

            {reportsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <div className="glass rounded-2xl py-16 text-center text-sm text-muted-foreground">
                No reports yet.
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden divide-y divide-border/50">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 flex items-start gap-4">
                    <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-500/30 grid place-items-center shrink-0">
                      <Flag className="size-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {r.reporter.username ?? r.reporter.email}
                        </span>
                        <span>reported</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-border font-mono">
                          {r.targetType}
                        </span>
                        <span className="font-mono text-[10px]">{r.targetId}</span>
                        <span className="ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-sm">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalReportsPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{reportsTotal} reports total</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={reportsPage === 1}
                    onClick={() => setReportsPage((p) => p - 1)}
                    className="h-8 px-3 rounded-lg border border-border text-xs disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="h-8 px-3 grid place-items-center text-xs text-muted-foreground">
                    {reportsPage} / {totalReportsPages}
                  </span>
                  <button
                    type="button"
                    disabled={reportsPage >= totalReportsPages}
                    onClick={() => setReportsPage((p) => p + 1)}
                    className="h-8 px-3 rounded-lg border border-border text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
