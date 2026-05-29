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

export type ProjectCatalogFilters = {
  industry?: string;
  country?: string;
  q?: string;
};

/** GET /api/projects?industry=&country=&q= — каталог OPEN */
export async function getProjects(filters?: ProjectCatalogFilters) {
  try {
    const params = new URLSearchParams();
    if (filters?.industry) params.set("industry", filters.industry);
    if (filters?.country) params.set("country", filters.country);
    if (filters?.q) params.set("q", filters.q);
    const qs = params.toString();
    return await api.get<ProjectListItem[]>(`/projects${qs ? `?${qs}` : ""}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load projects";
    return { error: message };
  }
}

/** PATCH /api/projects/:id — только OPEN, только владелец */
export async function updateProject(
  projectId: string,
  data: Partial<CreateProjectInput>,
) {
  try {
    return await api.patch<ProjectDetail>(`/projects/${projectId}`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update project";
    return { error: message };
  }
}

/** PATCH /api/projects/:id/complete — IN_PROGRESS → COMPLETED */
export async function completeProject(projectId: string) {
  try {
    return await api.patch<ProjectListItem>(`/projects/${projectId}/complete`, {});
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to complete project";
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

/** DELETE /api/projects/:id — только владелец; отклики удаляются каскадом */
export async function deleteProject(projectId: string) {
  try {
    return await api.delete<{ success: boolean }>(`/projects/${projectId}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete project";
    return { error: message };
  }
}
