import { api } from "@/lib/api";

export async function completeOnboarding(data: { role: string; username: string }) {
  try {
    return await api.post<{ success: boolean }>("/onboarding/complete", data);
  } catch (e: any) {
    return { error: e?.message || "Something went wrong." };
  }
}
