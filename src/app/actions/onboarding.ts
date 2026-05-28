"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

export async function completeOnboarding(data: {
  role: Role;
  username: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/register");

  const username = data.username.trim().toLowerCase();

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3–30 characters: letters, numbers, underscores only." };
  }

  const taken = await prisma.user.findUnique({ where: { username } });
  if (taken && taken.id !== user.id) {
    return { error: "This username is already taken." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: data.role, username, onboardingCompleted: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("show_welcome", "1", { maxAge: 30, path: "/" });

  redirect("/dashboard");
}
