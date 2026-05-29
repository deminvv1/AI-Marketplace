import { api } from "@/lib/api";

export type ReportInput = {
  type: string;
  targetId: string;
  targetType: string;
  description?: string;
};

export async function createReport(data: ReportInput) {
  try {
    return await api.post<{ id: string; status: string }>("/reports", data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to submit report";
    return { error: message };
  }
}
