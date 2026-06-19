import { api } from "@/lib/api";

export type AdminStats = {
  users: number;
  projects: number;
  solutions: number;
  forumPosts: number;
  proposals: number;
  reports: number;
  blocked: number;
};

export type AdminUserItem = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  avatarUrl: string | null;
  profile: { firstName: string | null; lastName: string | null; country: string | null } | null;
};

export type AdminUsersPage = {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
  reporter: { id: string; email: string; username: string | null };
};

export type AdminReportsPage = {
  items: AdminReport[];
  total: number;
  page: number;
  limit: number;
};

export async function adminGetStats(): Promise<AdminStats | { error: string }> {
  try {
    return await api.get<AdminStats>("/admin/stats");
  } catch (e: any) {
    return { error: e.message ?? "Error" };
  }
}

export async function adminListUsers(
  q?: string,
  page = 1,
): Promise<AdminUsersPage | { error: string }> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (q) params.set("q", q);
    return await api.get<AdminUsersPage>(`/admin/users?${params}`);
  } catch (e: any) {
    return { error: e.message ?? "Error" };
  }
}

export async function adminBanUser(id: string): Promise<{ isBlocked: boolean } | { error: string }> {
  try {
    return await api.post<{ isBlocked: boolean }>(`/admin/users/${id}/ban`, {});
  } catch (e: any) {
    return { error: e.message ?? "Error" };
  }
}

export async function adminUnbanUser(id: string): Promise<{ isBlocked: boolean } | { error: string }> {
  try {
    return await api.post<{ isBlocked: boolean }>(`/admin/users/${id}/unban`, {});
  } catch (e: any) {
    return { error: e.message ?? "Error" };
  }
}

export async function adminListReports(
  page = 1,
): Promise<AdminReportsPage | { error: string }> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    return await api.get<AdminReportsPage>(`/admin/reports?${params}`);
  } catch (e: any) {
    return { error: e.message ?? "Error" };
  }
}
