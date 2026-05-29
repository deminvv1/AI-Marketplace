import { api } from "@/lib/api";

/**
 * Server-side вызовы API проектов (Project).
 * Не ходим в Prisma с клиента — только Nest /api/projects.
 */

export type ProjectListItem = {
  id: string;
  title: string;
  shortDescription: string | null;
  description: string;
  industry: string | null;
  tags: string[];
  budget: string | null;
  deadline: string | null;
  country: string | null;
  language: string | null;
  workFormat: string | null;
  status: string;
  createdAt: string;
  client: { id: string; username: string | null; avatarUrl: string | null };
  _count: { proposals: number };
};

/** Детальная карточка = список + служебные поля для страницы /projects/[id] */
export type ProjectDetail = ProjectListItem & {
  updatedAt: string;
  freelancerId: string | null;
  freelancer: { id: string; username: string | null; avatarUrl: string | null } | null;
};

export type CreateProjectInput = {
  title: string;
  description: string;
  shortDescription?: string;
  industry?: string;
  tags?: string[];
  budget?: string;
  deadline?: string;
  country?: string;
  language?: string;
  workFormat?: string;
};

/** GET /api/projects/:id */
export async function getProject(id: string) {
  try {
    return await api.get<ProjectDetail>(`/projects/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load project";
    return { error: message };
  }
}

/** GET /api/projects — каталог OPEN */
export async function getProjects() {
  try {
    return await api.get<ProjectListItem[]>("/projects");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load projects";
    return { error: message };
  }
}

export async function getMyProjects() {
  try {
    return await api.get<ProjectListItem[]>("/projects/mine");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load your projects";
    return { error: message };
  }
}

export async function createProject(data: CreateProjectInput) {
  try {
    return await api.post<ProjectListItem>("/projects", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create project";
    return { error: message };
  }
}
