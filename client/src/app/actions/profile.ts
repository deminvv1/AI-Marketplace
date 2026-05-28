import { api } from "@/lib/api";

export async function getMyProfile() {
  return api.get<any>("/profile");
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  bio: string;
  specialization: string;
  industries: string[];
  experience: string;
  country: string;
  phone: string;
}) {
  try {
    return await api.patch<{ success: boolean }>("/profile", data);
  } catch (e: any) {
    return { error: e?.message || "Failed to save." };
  }
}
