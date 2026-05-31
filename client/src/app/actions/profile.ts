import { api } from "@/lib/api";

/**
 * Свой профиль (владелец): GET/PATCH /api/profile
 * Портфолио: CRUD /api/profile/portfolio
 */

export type PortfolioItem = {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MyProfile = {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    specialization: string | null;
    industries: string[];
    experience: string | null;
    country: string | null;
    phone: string | null;
    language: string | null;
    rating: number;
    reviewsCount: number;
    completedProjectsCount: number;
    viewCount: number;
    portfolioItems: PortfolioItem[];
  } | null;
};

export async function getMyProfile() {
  try {
    return await api.get<MyProfile>("/profile");
  } catch {
    return null;
  }
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  bio: string;
  specialization: string;
  industries: string[];
  experience: string;
  country: string;
  phone: string;
}) {
  try {
    return await api.patch<{ success: boolean }>("/profile", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to save.";
    return { error: message };
  }
}

export type PortfolioItemInput = {
  type: string;
  title?: string;
  content?: string;
  url?: string;
};

export async function createPortfolioItem(data: PortfolioItemInput) {
  try {
    return await api.post<PortfolioItem>("/profile/portfolio", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to add item";
    return { error: message };
  }
}

export async function updatePortfolioItem(itemId: string, data: PortfolioItemInput) {
  try {
    return await api.patch<PortfolioItem>(`/profile/portfolio/${itemId}`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update item";
    return { error: message };
  }
}

export async function deletePortfolioItem(itemId: string) {
  try {
    return await api.delete<{ success: boolean }>(`/profile/portfolio/${itemId}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete item";
    return { error: message };
  }
}
