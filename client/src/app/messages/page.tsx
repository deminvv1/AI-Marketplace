"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { UserSafetyActions } from "@/components/user-safety-actions";
import { getMe } from "@/app/actions/me";
import {
  getConversationMessages,
  getConversations,
  sendMessage,
  startConversation,
  type ChatMessage,
  type ConversationListItem,
} from "@/app/actions/messages";
import { formatMessageTime, messageUserName } from "@/lib/messages";
import { useChatSocket } from "@/lib/use-chat-socket";
import { ArrowLeft, Loader2, Send } from "lucide-react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [meId, setMeId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const loadConversations = useCallback(async () => {
    const res = await getConversations();
    if ("error" in res && res.error) {
      setError(res.error);
      return [];
    }
    if (Array.isArray(res)) {
      setConversations(res);
      return res;
    }
    return [];
  }, []);

  const openConversation = useCallback(async (conversationId: string) => {
    setActiveId(conversationId);
    setMessagesLoading(true);
    setError(null);
    const res = await getConversationMessages(conversationId);
    setMessagesLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      setMessages([]);
      return;
    }
    if (Array.isArray(res)) setMessages(res);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const me = await getMe();
      if (cancelled) return;
      setMeId(me?.id ?? null);

      let list = await loadConversations();
      if (cancelled) return;

      if (withUserId && me?.id && withUserId !== me.id) {
        const started = await startConversation(withUserId);
        if (!cancelled && "id" in started && started.id) {
          list = await loadConversations();
          setActiveId(started.id);
          router.replace("/messages");
          const msgs = await getConversationMessages(started.id);
          if (Array.isArray(msgs)) setMessages(msgs);
        } else if ("error" in started && started.error) {
          setError(started.error);
        }
      } else if (list.length > 0 && !activeId) {
        const first = list[0];
        setActiveId(first.id);
        const msgs = await getConversationMessages(first.id);
        if (Array.isArray(msgs)) setMessages(msgs);
      }

      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open ?with= once on mount
  }, [withUserId]);

  // WebSocket — real-time messages + presence
  const { sendMessage: socketSend, connected } = useChatSocket({
    conversationId: activeId,
    onNewMessage: (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as any];
      });
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeId
              ? { ...c, lastMessage: { id: msg.id, content: msg.content, senderId: msg.senderId, createdAt: msg.createdAt, isRead: false }, lastMessageAt: msg.createdAt }
              : c,
          )
          .sort((a, b) => new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()),
      );
    },
    onPresence: (userId, online) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.otherUser?.id !== userId) return c;
          const p = c.otherUser.profile;
          return {
            ...c,
            otherUser: {
              ...c.otherUser,
              profile: p ? { ...p, onlineStatus: online } : p,
            },
          } as ConversationListItem;
        }),
      );
    },
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");

    if (connected) {
      socketSend(activeId, content);
      return;
    }

    // Fallback: HTTP if socket disconnected
    setSending(true);
    setError(null);
    const res = await sendMessage(activeId, content);
    setSending(false);
    if ("error" in res && res.error) { setError(res.error); return; }
    if (res && "id" in res) {
      setMessages((prev) => [...prev, res]);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-2xl overflow-hidden h-[calc(100dvh-8rem)] lg:h-[calc(100vh-12rem)] flex">
        {/* Conversations list */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex-col overflow-y-auto shrink-0 ${activeId ? "hidden md:flex" : "flex"}`}>
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No conversations yet. Open a freelancer profile and click Write.
            </p>
          ) : (
            conversations.map((c) => {
              const name = messageUserName(c.otherUser);
              const selected = c.id === activeId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openConversation(c.id)}
                  className={`w-full p-4 flex gap-3 border-b border-border/60 text-left transition ${
                    selected ? "bg-primary/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="size-11 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">
                      {name[0]?.toUpperCase()}
                    </div>
                    {c.otherUser?.profile?.onlineStatus && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{name}</span>
                      {c.lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatMessageTime(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">
                        {c.lastMessage?.content ?? "No messages yet"}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="size-5 rounded-full bg-primary text-white text-[10px] grid place-items-center shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Chat panel */}
        <div className={`flex-1 flex-col min-w-0 ${activeId ? "flex" : "hidden md:flex"}`}>
          {!active ? (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="h-14 lg:h-16 border-b border-border px-3 lg:px-5 flex items-center gap-2 lg:gap-3">
                {/* Back button — mobile only */}
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="size-8 grid place-items-center rounded-lg hover:bg-white/5 transition md:hidden shrink-0"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div className="relative shrink-0">
                  <div className="size-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-semibold">
                    {messageUserName(active.otherUser)[0]?.toUpperCase()}
                  </div>
                  {active.otherUser?.profile?.onlineStatus && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-card" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {messageUserName(active.otherUser)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {active.otherUser?.profile?.onlineStatus ? "Online" : "Offline"}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {active.otherUser?.id && meId && active.otherUser.id !== meId && (
                    <UserSafetyActions
                      targetId={active.otherUser.id}
                      targetType="user"
                      targetLabel={messageUserName(active.otherUser)}
                    />
                  )}
                  {active.otherUser?.username && (
                    <Link
                      href={`/freelancers/${active.otherUser.username}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Say hello — your first message starts the thread.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === meId;
                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2 max-w-[75%] ${mine ? "ml-auto justify-end" : ""}`}
                      >
                        {!mine && (
                          <div className="size-7 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-semibold shrink-0">
                            {messageUserName(active.otherUser)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                            mine
                              ? "rounded-tr-sm bg-gradient-primary text-white"
                              : "rounded-tl-sm glass"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-border p-3 flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  className="flex-1 h-10 px-4 rounded-xl bg-white/5 border border-border text-sm focus:outline-none focus:border-primary transition"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="size-10 grid place-items-center rounded-xl bg-gradient-primary text-white glow-primary disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </form>
              {error && (
                <p className="px-4 pb-2 text-xs text-destructive">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function MessagesPage() {
  return (
    <AppShell title="Messages">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin" />
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </AppShell>
  );
}
