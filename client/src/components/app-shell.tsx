"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, ShoppingBag, MessagesSquare,
  MessageCircle, User, Settings, Sparkles, Search, Send, Bookmark,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { getMe } from "@/app/actions/me";
import { NotificationsBell } from "@/components/notifications-bell";
import { createClient } from "@/lib/supabase/client";
import { getSocket } from "@/lib/socket";
import { usePresence } from "@/lib/use-presence";

type Me = Awaited<ReturnType<typeof getMe>>;

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/search", label: "Search", icon: Search },
  { to: "/projects", label: "Projects", icon: ClipboardList },
  { to: "/proposals", label: "My proposals", icon: Send },
  { to: "/freelancers", label: "Freelancers", icon: Users },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/solutions", label: "Solutions", icon: ShoppingBag },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [headerQuery, setHeaderQuery] = useState("");

  useEffect(() => {
    getMe().then(setMe);
    const refresh = () => getMe().then(setMe);
    window.addEventListener("user-updated", refresh);
    return () => window.removeEventListener("user-updated", refresh);
  }, []);

  usePresence();

  // Global WebSocket connection — connects once, stays alive across navigations
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      getSocket(session.access_token);
    })();
    // No cleanup here — socket must stay alive between page navigations
  }, []);

  const displayName =
    [me?.profile?.firstName, me?.profile?.lastName].filter(Boolean).join(" ") ||
    me?.username ||
    "…";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLine = [me?.role ?? "", me?.profile?.country ?? ""].filter(Boolean).join(" · ");

  const BOTTOM_NAV = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: ClipboardList },
    { to: "/search", label: "Search", icon: Search },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow-primary">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight">AI Marketplace</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Global · v1</div>
          </div>
        </div>
        <nav className="px-3 py-2 flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link key={to} href={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-primary/15 text-foreground border border-primary/40 glow-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}>
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/60">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="size-9 rounded-full bg-gradient-primary overflow-hidden grid place-items-center text-sm font-semibold select-none shrink-0">
              {me?.avatarUrl
                ? <img src={me.avatarUrl} alt="avatar" className="size-full object-cover" />
                : initials
              }
            </div>
            <div className="text-xs min-w-0">
              <div className="font-medium truncate">{displayName}</div>
              <div className="text-muted-foreground truncate">{roleLine}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b border-border/60 px-4 md:px-8 flex items-center gap-4 sticky top-0 z-30 bg-background/60 backdrop-blur-xl">
          {/* Mobile: logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
              <Sparkles className="size-4 text-white" />
            </div>
          </div>
          <h1 className="text-sm md:text-lg font-semibold tracking-tight truncate">{title}</h1>
          <div className="flex-1" />
          <form
            className="relative w-72 max-w-full hidden md:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = headerQuery.trim();
              router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
            }}
          >
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={headerQuery}
              onChange={(e) => setHeaderQuery(e.target.value)}
              placeholder="Search projects, freelancers, forum…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </form>
          <NotificationsBell />
        </header>
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-sidebar/80 backdrop-blur-2xl">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {BOTTOM_NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
            return (
              <Link key={to} href={to}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                <Icon className={`size-5 ${active ? "glow-primary" : ""}`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
