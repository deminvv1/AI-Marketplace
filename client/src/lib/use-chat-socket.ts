"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export type SocketMessage = {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  createdAt: string;
};

interface Options {
  conversationId: string | null;
  onNewMessage?: (msg: SocketMessage) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
  onNotification?: (notif: any) => void;
  onPresence?: (userId: string, online: boolean) => void;
}

export function useChatSocket({ conversationId, onNewMessage, onTyping, onNotification, onPresence }: Options) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token || !active) return;

      const sock = getSocket(session.access_token) as import("socket.io-client").Socket;
      if (!sock) return;
      socketRef.current = sock;

      sock.on("connect", () => { if (active) setConnected(true); });
      sock.on("disconnect", () => { if (active) setConnected(false); });

      sock.on("new_message", (data: { conversationId: string; message: SocketMessage }) => {
        if (active) onNewMessage?.(data.message);
      });

      sock.on("typing", (data: { userId: string; isTyping: boolean }) => {
        if (active) onTyping?.(data.userId, data.isTyping);
      });

      sock.on("notification", (notif: any) => {
        if (active) onNotification?.(notif);
      });

      sock.onAny((event: string, data: any) => {
        if (active && event.startsWith("presence:")) {
          const userId = event.replace("presence:", "");
          onPresence?.(userId, data?.online ?? false);
        }
      });
    })();

    return () => {
      active = false;
      const sock = socketRef.current;
      if (sock) {
        sock.off("new_message");
        sock.off("typing");
        sock.off("notification");
        sock.off("connect");
        sock.off("disconnect");
      }
    };
  }, []);

  // Join conversation room when conversationId changes
  useEffect(() => {
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit("join_conversation", { conversationId });
  }, [conversationId]);

  function sendMessage(convId: string, content: string) {
    socketRef.current?.emit("send_message", { conversationId: convId, content });
  }

  function sendTyping(convId: string, isTyping: boolean) {
    socketRef.current?.emit("typing", { conversationId: convId, isTyping });
  }

  return { connected, sendMessage, sendTyping };
}