"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/app/actions/notifications";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    const c = await getUnreadNotificationCount();
    setCount(c.count ?? 0);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotifications().then((res) => {
      if (Array.isArray(res)) setItems(res);
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function openItem(n: NotificationItem) {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
      setCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative size-9 grid place-items-center rounded-lg bg-white/5 border border-border hover:border-primary/50 transition"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-[10px] font-bold text-white grid place-items-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Notifications</span>
            {count > 0 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={async () => {
                  await markAllNotificationsRead();
                  setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  setCount(0);
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-6">No notifications yet.</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id} className="border-b border-border/50 last:border-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => openItem(n)}
                      className={`block px-4 py-3 hover:bg-white/5 ${!n.isRead ? "bg-primary/5" : ""}`}
                    >
                      <NotificationRow n={n} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 ${!n.isRead ? "bg-primary/5" : ""}`}
                    >
                      <NotificationRow n={n} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n }: { n: NotificationItem }) {
  return (
    <>
      <div className="text-sm font-medium line-clamp-1">{n.title}</div>
      {n.body && (
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>
      )}
      <div className="text-[10px] text-muted-foreground mt-1">
        {new Date(n.createdAt).toLocaleString()}
      </div>
    </>
  );
}
