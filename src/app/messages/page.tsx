"use client"; // Обязательно, так как интерфейс чата интерактивный и использует динамическую разметку

import { AppShell } from "@/components/app-shell";
import { CONVERSATIONS } from "@/lib/mock-data";
import { Mic, Smile, Send, Play } from "lucide-react";

export default function MessagesPage() {
  return (
    <AppShell title="Messages">
      <div className="grid grid-cols-12 gap-0 glass rounded-2xl overflow-hidden h-[calc(100vh-12rem)]">
        {/* Список диалогов (сайдбар) */}
        <div className="col-span-4 border-r border-border overflow-y-auto">
          {CONVERSATIONS.map((c, i) => (
            <button
              key={c.name}
              className={`w-full p-4 flex gap-3 border-b border-border/60 text-left transition ${i === 0 ? "bg-primary/10" : "hover:bg-white/5"}`}
            >
              <div className="relative shrink-0">
                <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">
                  {c.name[0]}
                </div>
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success border-2 border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">{c.last}</span>
                  {c.unread > 0 && (
                    <span className="size-5 rounded-full bg-primary text-white text-[10px] grid place-items-center glow-primary">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Окно открытого чата */}
        <div className="col-span-8 flex flex-col">
          {/* Шапка чата */}
          <div className="h-16 border-b border-border px-5 flex items-center gap-3">
            <div className="relative">
              <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">
                A
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success border-2 border-card" />
            </div>
            <div>
              <div className="text-sm font-medium">Anya Volkov</div>
              <div className="text-[11px] text-success">Online · typing…</div>
            </div>
            <button className="ml-auto text-xs text-primary hover:underline">View profile</button>
          </div>

          {/* Лента сообщений */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex gap-2 max-w-[70%]">
              <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold shrink-0">
                A
              </div>
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm">
                Hey! I&apos;ve finished the first eval pass on the radiology dataset.
              </div>
            </div>
            <div className="flex gap-2 max-w-[70%] ml-auto justify-end">
              <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm bg-gradient-primary text-white">
                Amazing — what&apos;s the headline number?
              </div>
            </div>

            {/* Голосовое сообщение */}
            <div className="flex gap-2 max-w-[70%]">
              <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold shrink-0">
                A
              </div>
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3">
                <button className="size-9 rounded-full bg-primary text-white grid place-items-center glow-primary">
                  <Play className="size-4" />
                </button>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-primary rounded-full"
                      style={{ height: `${8 + Math.abs(Math.sin(i)) * 18}px` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">0:42</span>
              </div>
            </div>

            <div className="flex gap-2 max-w-[70%] ml-auto justify-end">
              <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm bg-gradient-primary text-white">
                Sent over the v2 weights — let me know if the eval improved.
              </div>
            </div>
          </div>

          {/* Панель ввода сообщения */}
          <div className="border-t border-border p-3 flex items-center gap-2">
            <input
              placeholder="Write a message…"
              className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition"
            />
            <button className="size-10 grid place-items-center rounded-xl bg-white/5 border border-border hover:border-primary/50 transition">
              <Mic className="size-4" />
            </button>
            <button className="size-10 grid place-items-center rounded-xl bg-white/5 border border-border hover:border-primary/50 transition">
              <Smile className="size-4" />
            </button>
            <button className="size-10 grid place-items-center rounded-xl bg-gradient-primary text-white glow-primary">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
