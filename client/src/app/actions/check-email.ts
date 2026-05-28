import { api } from "@/lib/api";

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  return api.get<{ exists: boolean }>(
    `/users/check-email?email=${encodeURIComponent(email)}`
  );
}
