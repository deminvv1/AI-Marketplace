import { api } from "@/lib/api";

export async function getMe() {
  try {
    return await api.get<{
      username: string | null;
      role: string;
      profile: { firstName: string | null; lastName: string | null; country: string | null } | null;
    }>("/users/me");
  } catch {
    return null;
  }
}
