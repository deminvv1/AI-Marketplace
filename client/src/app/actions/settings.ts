import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export async function getSettings() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const data = await api.get<any>("/settings");
  return { ...data, authEmail: session?.user?.email ?? "" };
}

export async function updateAccount(data: { username: string; role: string }) {
  try {
    return await api.patch<{ success: boolean }>("/settings/account", data);
  } catch (e: any) {
    return { error: e?.message || "Failed to save." };
  }
}

export async function updatePrivacy(data: {
  phoneVisible: boolean;
  emailVisible: boolean;
  profileVisible: boolean;
  onlineVisible: boolean;
  lastSeenVisible: boolean;
}) {
  try {
    return await api.patch<{ success: boolean }>("/settings/privacy", data);
  } catch (e: any) {
    return { error: e?.message || "Failed to save." };
  }
}

export async function deleteAvatar() {
  try {
    return await api.delete<{ success: boolean }>("/users/avatar");
  } catch (e: any) {
    return { error: e?.message || "Failed to delete." };
  }
}

export async function uploadAvatar(file: File) {
  try {
    const form = new FormData();
    form.append("avatar", file);
    return await api.upload<{ avatarUrl: string }>("/users/avatar", form);
  } catch (e: any) {
    return { error: e?.message || "Upload failed." };
  }
}

export async function deleteAccount() {
  try {
    await api.delete<{ success: boolean }>("/settings");
    const supabase = createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (e: any) {
    return { error: e?.message || "Failed to delete." };
  }
}
