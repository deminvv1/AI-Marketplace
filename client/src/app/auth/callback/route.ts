import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const VALID_ROLES = ["CUSTOMER", "EXECUTOR", "BOTH", "ADMIN"];

async function apiPost(path: string, token: string, body: object) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/register?error=auth`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/register?error=link_expired`);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(`${origin}/register?error=auth`);
    }

    const token = session.access_token;

    const cookieStore = await cookies();
    const pendingRole = cookieStore.get("pending_role")?.value;
    const role = pendingRole && VALID_ROLES.includes(pendingRole) ? pendingRole : null;
    if (role) cookieStore.delete("pending_role");

    // Create user in DB via NestJS if not exists, and get current state
    const initRes = await apiPost("/onboarding/init", token, {
      role: role ?? "CUSTOMER",
      avatarUrl: session.user.user_metadata?.avatar_url ?? null,
    });

    if (!initRes.ok) {
      return NextResponse.redirect(`${origin}/register?error=auth`);
    }

    const dbUser = await initRes.json();

    if (!dbUser.onboardingCompleted) {
      return NextResponse.redirect(
        `${origin}/onboarding${role ? "?skip_role=1" : ""}`
      );
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (e) {
    console.error("Auth callback error:", e);
    return NextResponse.redirect(`${origin}/register?error=auth`);
  }
}
