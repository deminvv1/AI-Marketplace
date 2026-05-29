import { api } from "@/lib/api";

/** Текущий User из Nest (совпадает с id в Supabase JWT). */
export async function getMe() {
  try {
    return await api.get<{
      id: string;
      username: string | null;
      role: string;
      profile: { firstName: string | null; lastName: string | null; country: string | null } | null;
    }>("/users/me");
  } catch {
    return null;
  }
}
