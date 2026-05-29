import { api } from "@/lib/api";

/**
 * Визитки фрилансеров (после входа в приложение).
 * GET /api/freelancers, GET /api/freelancers/:username
 */

export type FreelancerListItem = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    specialization: string | null;
    country: string | null;
    rating: number;
    reviewsCount: number;
    onlineStatus: boolean;
  } | null;
};

export type FreelancerPublicProfile = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    country: string | null;
    language: string | null;
    specialization: string | null;
    industries: string[];
    experience: string | null;
    rating: number;
    reviewsCount: number;
    completedProjectsCount: number;
    onlineStatus: boolean;
    viewCount: number;
    portfolioItems: {
      id: string;
      title: string | null;
      content: string | null;
      type: string;
      url: string | null;
    }[];
  } | null;
};

export async function listFreelancers() {
  try {
    return await api.get<FreelancerListItem[]>("/freelancers");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load freelancers";
    return { error: message };
  }
}

/** Открытие /freelancers/:username — на бэке пишется ProfileView */
export async function getFreelancerByUsername(username: string) {
  try {
    const slug = username.replace(/^@/, "");
    return await api.get<FreelancerPublicProfile>(`/freelancers/${encodeURIComponent(slug)}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Freelancer not found";
    return { error: message };
  }
}
