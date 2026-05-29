import { api } from "@/lib/api";

export type MessageParticipant = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    onlineStatus?: boolean | null;
  } | null;
};

export type ConversationListItem = {
  id: string;
  lastMessageAt: string | null;
  otherUser: MessageParticipant | null;
  lastMessage: {
    id: string;
    content: string | null;
    senderId: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  content: string | null;
  senderId: string;
  isRead: boolean;
  createdAt: string;
};

export async function getConversations() {
  try {
    return await api.get<ConversationListItem[]>("/messages/conversations");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load conversations";
    return { error: message };
  }
}

export async function startConversation(participantId: string) {
  try {
    return await api.post<ConversationListItem>("/messages/conversations", {
      participantId,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to start conversation";
    return { error: message };
  }
}

export async function getConversationMessages(conversationId: string) {
  try {
    return await api.get<ChatMessage[]>(
      `/messages/conversations/${conversationId}/messages`,
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load messages";
    return { error: message };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  try {
    return await api.post<ChatMessage>(
      `/messages/conversations/${conversationId}/messages`,
      { content },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to send message";
    return { error: message };
  }
}
