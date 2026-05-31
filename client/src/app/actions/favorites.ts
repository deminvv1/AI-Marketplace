import { api } from "@/lib/api";

/**
 * Избранное (Favorite): freelancer | project | solution
 * /api/favorites
 */

export type FavoriteFreelancer = {
  id: string;
  targetId: string;
  targetType: string;
  createdAt: string;
  freelancer?: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      specialization: string | null;
      country: string | null;
      rating: number;
      onlineStatus: boolean;
    } | null;
  } | null;
  project?: {
    id: string;
    title: string;
    shortDescription: string | null;
    industry: string | null;
    budget: string | null;
    country: string | null;
    status: string;
  } | null;
  solution?: {
    id: string;
    title: string;
    industry: string | null;
    price: string | null;
    preview: string | null;
    isPublished: boolean;
  } | null;
};

export type FavoriteItem = FavoriteFreelancer;

export async function getFavorites(targetType?: string) {
  try {
    const qs = targetType ? `?targetType=${encodeURIComponent(targetType)}` : "";
    return await api.get<FavoriteItem[]>(`/favorites${qs}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load favorites";
    return { error: message };
  }
}

export async function checkFavorite(targetId: string, targetType: string) {
  try {
    return await api.get<{ favorited: boolean }>(
      `/favorites/check?targetId=${encodeURIComponent(targetId)}&targetType=${encodeURIComponent(targetType)}`,
    );
  } catch {
    return { favorited: false };
  }
}

export async function addFavorite(targetId: string, targetType: string) {
  try {
    return await api.post<{ id: string }>("/favorites", { targetId, targetType });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return { error: message };
  }
}

export async function removeFavorite(targetId: string, targetType: string) {
  try {
    return await api.delete<{ success: boolean }>("/favorites", {
      targetId,
      targetType,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to remove";
    return { error: message };
  }
}
