"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, ShoppingBag, MessagesSquare,
  MessageCircle, User, Settings, Sparkles, Search, Send, Bookmark, Menu, X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { getMe } from "@/app/actions/me";
import { NotificationsBell } from "@/components/notifications-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { getSocket } from "@/lib/socket";
import { usePresence } from "@/lib/use-presence";
import { useI18n } from "@/lib/i18n";

type Me = Awaited<ReturnType<typeof getMe>>;

const NAV_ROUTES = [
  { to: "/dashboard",  key: "dashboard"  as const, icon: LayoutDashboard },
  { to: "/search",     key: "search"     as const, icon: Search },
  { to: "/projects",   key: "projects"   as const, icon: ClipboardList },
  { to: "/proposals",  key: "proposals"  as const, icon: Send },
  { to: "/freelancers",key: "freelancers"as const, icon: Users },
  { to: "/saved",      key: "saved"      as const, icon: Bookmark },
  { to: "/solutions",  key: "solutions"  as const, icon: ShoppingBag },
  { to: "/forum",      key: "forum"      as const, icon: MessagesSquare },
  { to: "/messages",   key: "messages"   as const, icon: MessageCircle },
  { to: "/profile",    key: "profile"    as const, icon: User },
  { to: "/settings",   key: "settings"   as const, icon: Settings },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [headerQuery, setHeaderQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    getMe().then(setMe);
    const refresh = () => getMe().then(setMe);
    window.addEventListener("user-updated", refresh);
    return () => window.removeEventListener("user-updated", refresh);
  }, []);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  usePresence();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      getSocket(session.access_token);
    })();
  }, []);

  const displayName =
    [me?.profile?.firstName, me?.profile?.lastName].filter(Boolean).join(" ") ||
    me?.username ||
    "…";
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLine = [me?.role ?? "", me?.profile?.country ?? ""].filter(Boolean).join(" · ");

  const sidebarContent = (
    <>
      <div className="px-6 py-5 flex items-center gap-2">
        <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow-primary shrink-0">
          <Sparkles className="size-5 text-white" />
        </div>
        <div>
          <div className="font-bold tracking-tight">AI Marketplace</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Global · v1</div>
        </div>
      </div>
      <nav className="px-3 py-2 flex-1 space-y-1 overflow-y-auto">
        {NAV_ROUTES.map(({ to, key, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link key={to} href={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-primary/15 text-foreground border border-primary/40 glow-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}>
              <Icon className="size-4 shrink-0" />
              <span>{t.nav[key]}</span>
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
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl flex-col sticky top-0 h-screen hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-sidebar border-r border-border/60 flex flex-col transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 size-8 grid place-items-center rounded-lg bg-white/5 hover:bg-white/10 transition"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 lg:h-16 border-b border-border/60 px-4 lg:px-8 flex items-center gap-3 sticky top-0 z-30 bg-background/60 backdrop-blur-xl">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="size-9 grid place-items-center rounded-lg bg-white/5 border border-border hover:border-primary/50 transition lg:hidden shrink-0"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <h1 className="text-base lg:text-lg font-semibold tracking-tight truncate">{title}</h1>
          <div className="flex-1" />
          <form
            className="relative w-64 max-w-full hidden md:block"
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
              placeholder={t.header.search_placeholder}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-primary transition-all"
            />
          </form>
          <LanguageSwitcher />
          <NotificationsBell />
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
