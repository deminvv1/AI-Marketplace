import { api } from "@/lib/api";

/**
 * Solution — готовые AI-продукты фрилансера.
 * /api/solutions
 */

export type SolutionListItem = {
  id: string;
  title: string;
  industry: string | null;
  description: string;
  format: string | null;
  price: string | null;
  preview: string | null;
  mediaUrls: string[];
  tags: string[];
  language: string | null;
  country: string | null;
  viewsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  freelancer: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      rating: number;
      reviewsCount: number;
    } | null;
  };
};

export type SolutionInput = {
  title: string;
  description: string;
  industry?: string;
  format?: string;
  price?: string;
  preview?: string;
  mediaUrls?: string[];
  tags?: string[];
  language?: string;
  country?: string;
  isPublished?: boolean;
};

export type SolutionCatalogFilters = {
  industry?: string;
  tag?: string;
  format?: string;
  country?: string;
  q?: string;
};

export async function getSolutions(filters?: SolutionCatalogFilters) {
  try {
    const params = new URLSearchParams();
    if (filters?.industry) params.set("industry", filters.industry);
    if (filters?.tag) params.set("tag", filters.tag);
    if (filters?.format) params.set("format", filters.format);
    if (filters?.country) params.set("country", filters.country);
    if (filters?.q) params.set("q", filters.q);
    const qs = params.toString();
    return await api.get<SolutionListItem[]>(`/solutions${qs ? `?${qs}` : ""}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load solutions";
    return { error: message };
  }
}

export async function getMySolutions() {
  try {
    return await api.get<SolutionListItem[]>("/solutions/mine");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load your solutions";
    return { error: message };
  }
}

export async function getSolution(id: string) {
  try {
    return await api.get<SolutionListItem>(`/solutions/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Solution not found";
    return { error: message };
  }
}

export async function createSolution(data: SolutionInput) {
  try {
    return await api.post<SolutionListItem>("/solutions", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to publish solution";
    return { error: message };
  }
}

export async function updateSolution(id: string, data: SolutionInput) {
  try {
    return await api.patch<SolutionListItem>(`/solutions/${id}`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update solution";
    return { error: message };
  }
}

export async function deleteSolution(id: string) {
  try {
    return await api.delete<{ success: boolean }>(`/solutions/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete solution";
    return { error: message };
  }
}
