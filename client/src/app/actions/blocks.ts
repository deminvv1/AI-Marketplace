import { api } from "@/lib/api";

export type BlockedUserRow = {
  id: string;
  blockedId: string;
  createdAt: string;
  blocked: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: { firstName: string | null; lastName: string | null } | null;
  };
};

export async function getBlockedUsers() {
  try {
    return await api.get<BlockedUserRow[]>("/blocks");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load blocked users";
    return { error: message };
  }
}

export async function blockUser(blockedId: string) {
  try {
    return await api.post<BlockedUserRow>("/blocks", { blockedId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to block user";
    return { error: message };
  }
}

export async function unblockUser(blockedId: string) {
  try {
    return await api.delete<{ success: boolean }>(`/blocks/${blockedId}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to unblock user";
    return { error: message };
  }
}
