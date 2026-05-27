"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Users, ShoppingBag, MessagesSquare,
  MessageCircle, User, Settings, Sparkles, Search, Bell
} from "lucide-react";
import { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/executors", label: "Executors", icon: Users },
  { to: "/offers", label: "Ready Offers", icon: ShoppingBag },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-2xl flex flex-col sticky top-0 h-screen">
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
            <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">A</div>
            <div className="text-xs">
              <div className="font-medium">Alex Morgan</div>
              <div className="text-muted-foreground">Customer · 🇺🇸</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/60 px-8 flex items-center gap-4 sticky top-0 z-30 bg-background/60 backdrop-blur-xl">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          <div className="flex-1" />
          <div className="relative w-72 max-w-full hidden md:block">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search orders, executors, forum…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-primary transition-all" />
          </div>
          <button className="relative size-9 grid place-items-center rounded-lg bg-white/5 border border-border hover:border-primary/50 transition">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-secondary animate-pulse" />
          </button>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}