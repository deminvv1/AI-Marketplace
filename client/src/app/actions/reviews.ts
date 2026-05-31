import { api } from "@/lib/api";

/**
 * Отзывы (Review): рейтинг после COMPLETED-проекта.
 * /api/reviews
 */

export type ReviewItem = {
  id: string;
  rating: number;
  text: string | null;
  projectId: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: { firstName: string | null; lastName: string | null } | null;
  };
  project: { id: string; title: string } | null;
};

export async function getReviewsForUser(userId: string) {
  try {
    return await api.get<ReviewItem[]>(`/reviews/user/${userId}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load reviews";
    return { error: message };
  }
}

export async function getReviewForProject(projectId: string) {
  try {
    return await api.get<ReviewItem | null>(`/reviews/project/${projectId}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load review";
    return { error: message };
  }
}

export async function createReview(data: {
  toUserId: string;
  rating: number;
  text?: string;
  projectId?: string;
}) {
  try {
    return await api.post<ReviewItem>("/reviews", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to submit review";
    return { error: message };
  }
}
