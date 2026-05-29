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

export async function searchMarketplace(q: string): Promise<SearchResults> {
  const trimmed = q.trim();
  if (!trimmed) {
    return {
      projects: [],
      freelancers: [],
      solutions: [],
      forum: [],
    };
  }

  try {
    return await api.get<SearchResults>(
      `/search?q=${encodeURIComponent(trimmed)}`,
    );
  } catch {
    return {
      projects: [],
      freelancers: [],
      solutions: [],
      forum: [],
    };
  }
}
