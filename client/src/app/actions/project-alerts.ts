import { api } from "@/lib/api";

/** Project alerts — подписка на новые OPEN-проекты: /api/project-alerts */

export type ProjectAlertItem = {
  id: string;
  label: string | null;
  industry: string | null;
  country: string | null;
  q: string | null;
  tags: string[];
  notifyByEmail: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectAlertInput = {
  label?: string;
  industry?: string;
  country?: string;
  q?: string;
  tags?: string[];
  notifyByEmail?: boolean;
};

export async function getProjectAlerts() {
  try {
    return await api.get<ProjectAlertItem[]>("/project-alerts");
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load alerts";
    return { error: message };
  }
}

export async function createProjectAlert(data: ProjectAlertInput) {
  try {
    return await api.post<ProjectAlertItem>("/project-alerts", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to create alert";
    return { error: message };
  }
}

export async function updateProjectAlert(
  id: string,
  data: Partial<ProjectAlertInput> & { isActive?: boolean },
) {
  try {
    return await api.patch<ProjectAlertItem>(`/project-alerts/${id}`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to update alert";
    return { error: message };
  }
}

export async function deleteProjectAlert(id: string) {
  try {
    return await api.delete<{ success: boolean }>(`/project-alerts/${id}`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete alert";
    return { error: message };
  }
}
