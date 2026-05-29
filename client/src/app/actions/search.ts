import { getForumPosts } from "@/app/actions/forum";
import { listFreelancers } from "@/app/actions/freelancers";
import { getProjects } from "@/app/actions/projects";
import { getSolutions } from "@/app/actions/solutions";

/** Глобальный поиск — параллельные вызовы существующих API (см. docs/SEARCH.md) */

export type SearchTab = "all" | "projects" | "freelancers" | "solutions" | "forum";

export async function searchMarketplace(q: string) {
  const trimmed = q.trim();
  if (!trimmed) {
    return {
      projects: [],
      freelancers: [],
      solutions: [],
      forum: [],
    };
  }

  const [projects, freelancers, solutions, forum] = await Promise.all([
    getProjects({ q: trimmed }),
    listFreelancers({ q: trimmed }),
    getSolutions({ q: trimmed }),
    getForumPosts({ q: trimmed }),
  ]);

  return {
    projects: Array.isArray(projects) ? projects : [],
    freelancers: Array.isArray(freelancers) ? freelancers : [],
    solutions: Array.isArray(solutions) ? solutions : [],
    forum: Array.isArray(forum) ? forum : [],
  };
}
