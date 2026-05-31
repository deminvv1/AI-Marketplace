import { api } from "@/lib/api";
import type { ForumPostListItem } from "@/app/actions/forum";
import type { FreelancerListItem } from "@/app/actions/freelancers";
import type { ProjectListItem } from "@/app/actions/projects";
import type { SolutionListItem } from "@/app/actions/solutions";

/** Глобальный поиск: GET /api/search?q= (см. docs/SEARCH.md) */

export type SearchTab = "all" | "projects" | "freelancers" | "solutions" | "forum";

export type SearchResults = {
  projects: ProjectListItem[];
  freelancers: FreelancerListItem[];
  solutions: SolutionListItem[];
  forum: ForumPostListItem[];
};

export type SearchFilters = {
  q?: string;
  tag?: string;
  industry?: string;
};

export async function searchMarketplace(
  filters: SearchFilters,
): Promise<SearchResults> {
  const q = filters.q?.trim() ?? "";
  const tag = filters.tag?.trim();
  const industry = filters.industry?.trim();

  if (!q && !tag && !industry) {
    return {
      projects: [],
      freelancers: [],
      solutions: [],
      forum: [],
    };
  }

  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (industry) params.set("industry", industry);
    const qs = params.toString();
    return await api.get<SearchResults>(`/search${qs ? `?${qs}` : ""}`);
  } catch {
    return {
      projects: [],
      freelancers: [],
      solutions: [],
      forum: [],
    };
  }
}
