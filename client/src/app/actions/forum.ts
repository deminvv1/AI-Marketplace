import { api } from "@/lib/api";

/**
 * Форум: темы (ForumPost) + комментарии (ForumComment).
 * /api/forum/posts, /api/forum/posts/:id/comments
 */

export type ForumPostListItem = {
  id: string;
  title: string;
  content: string;
  industry: string | null;
  tags: string[];
  isPinned: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      country: string | null;
    } | null;
  };
  _count: { comments: number };
};

export type ForumPostDetail = ForumPostListItem & { authorId: string };

export type ForumCommentItem = {
  id: string;
  content: string;
  postId: string;
  parentCommentId: string | null;
  likesCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: { firstName: string | null; lastName: string | null } | null;
  };
  replies?: ForumCommentItem[];
};

export type ForumPostInput = {
  title: string;
  content: string;
  industry?: string;
  tags?: string[];
};

export async function getForumPosts(filters?: { industry?: string; q?: string }) {
  try {
    const params = new URLSearchParams();
    if (filters?.industry) params.set("industry", filters.industry);
    if (filters?.q) params.set("q", filters.q);
    const qs = params.toString();
    return await api.get<ForumPostListItem[]>(`/forum/posts${qs ? `?${qs}` : ""}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load topics";
    return { error: message };
  }
}

export async function getForumPost(id: string) {
  try {
    return await api.get<ForumPostDetail>(`/forum/posts/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Topic not found";
    return { error: message };
  }
}

export async function createForumPost(data: ForumPostInput) {
  try {
    return await api.post<ForumPostListItem>("/forum/posts", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create topic";
    return { error: message };
  }
}

export async function deleteForumPost(id: string) {
  try {
    return await api.delete<{ success: boolean }>(`/forum/posts/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete topic";
    return { error: message };
  }
}

export async function getForumComments(postId: string) {
  try {
    return await api.get<ForumCommentItem[]>(`/forum/posts/${postId}/comments`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load comments";
    return { error: message };
  }
}

export async function createForumComment(
  postId: string,
  data: { content: string; parentCommentId?: string },
) {
  try {
    return await api.post<ForumCommentItem>(`/forum/posts/${postId}/comments`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to post comment";
    return { error: message };
  }
}
