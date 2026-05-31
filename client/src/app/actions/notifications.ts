import { api } from "@/lib/api";

/** In-app уведомления: /api/notifications */

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export async function getNotifications() {
  try {
    return await api.get<NotificationItem[]>("/notifications");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load notifications";
    return { error: message };
  }
}

export async function getUnreadNotificationCount() {
  try {
    return await api.get<{ count: number }>("/notifications/unread-count");
  } catch {
    return { count: 0 };
  }
}

export async function markNotificationRead(id: string) {
  try {
    return await api.patch<NotificationItem>(`/notifications/${id}/read`, {});
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update";
    return { error: message };
  }
}

export async function markAllNotificationsRead() {
  try {
    return await api.patch("/notifications/read-all", {});
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update";
    return { error: message };
  }
}
