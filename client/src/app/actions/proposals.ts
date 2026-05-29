import { api } from "@/lib/api";

/**
 * Отклик фрилансера на проект (таблица Proposal в Prisma).
 * Вызывается только с клиента через lib/api.ts (JWT Supabase).
 */

export type ProposalItem = {
  id: string;
  projectId: string;
  coverLetter: string | null;
  proposedBudget: string | null;
  estimatedDays: number | null;
  status: string;
  createdAt: string;
  freelancer: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      specialization: string | null;
    } | null;
  };
};

export type CreateProposalInput = {
  coverLetter: string;
  proposedBudget?: string;
  estimatedDays?: number;
};

/** POST /api/projects/:projectId/proposals */
export async function createProposal(projectId: string, data: CreateProposalInput) {
  try {
    return await api.post<ProposalItem>(`/projects/${projectId}/proposals`, data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to send proposal";
    return { error: message };
  }
}

/** GET /api/projects/:projectId/proposals — только для владельца проекта */
export async function getProjectProposals(projectId: string) {
  try {
    return await api.get<ProposalItem[]>(`/projects/${projectId}/proposals`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load proposals";
    return { error: message };
  }
}

/** GET /api/projects/:projectId/proposals/mine — мой отклик на этот проект */
export async function getMyProposalOnProject(projectId: string) {
  try {
    return await api.get<ProposalItem | null>(`/projects/${projectId}/proposals/mine`);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load your proposal";
    return { error: message };
  }
}

/** PATCH accept — проект переходит в IN_PROGRESS, freelancerId назначается */
export async function acceptProposal(projectId: string, proposalId: string) {
  try {
    return await api.patch<ProposalItem>(
      `/projects/${projectId}/proposals/${proposalId}/accept`,
      {},
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to accept proposal";
    return { error: message };
  }
}

/** PATCH reject — только статус отклика REJECTED */
export async function rejectProposal(projectId: string, proposalId: string) {
  try {
    return await api.patch<ProposalItem>(
      `/projects/${projectId}/proposals/${proposalId}/reject`,
      {},
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to reject proposal";
    return { error: message };
  }
}
