import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { normalizeRole } from "@/lib/roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

/** Only same-origin paths are honoured — never an absolute or protocol-relative URL. */
function safePath(value: string | null | undefined): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Password sign-in has no code: the browser client already stored the session
  // in cookies, and only sends the user here to run onboarding/init.
  const verified = searchParams.get("verified") === "1";
  const next = safePath(searchParams.get("next"));

  if (!code && !verified) {
    return NextResponse.redirect(`${origin}/register?error=auth`);
  }

  try {
    const supabase = await createClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${origin}/register?error=link_expired`);
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(`${origin}/register?error=auth`);
    }

    // An explicit ?next= means the link had a purpose of its own — a password
    // reset, for instance — so honour it before the onboarding gate.
    if (next) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    const token = session.access_token;

    const cookieStore = await cookies();
    const pendingRole = normalizeRole(cookieStore.get("pending_role")?.value);
    const pendingCountry = cookieStore.get("pending_country")?.value
      ? decodeURIComponent(cookieStore.get("pending_country")!.value)
      : null;
    if (pendingRole) cookieStore.delete("pending_role");
    if (pendingCountry) cookieStore.delete("pending_country");

    const initRes = await apiPost("/onboarding/init", token, {
      role: pendingRole ?? "CLIENT",
      avatarUrl: session.user.user_metadata?.avatar_url ?? null,
      country: pendingCountry ?? null,
    });

    if (!initRes.ok) {
      return NextResponse.redirect(`${origin}/register?error=auth`);
    }

    const dbUser = await initRes.json();

    if (!dbUser.onboardingCompleted) {
      return NextResponse.redirect(
        `${origin}/onboarding${pendingRole ? "?skip_role=1" : ""}`
      );
    }

    // Return the user to the page that sent them to sign in, if any.
    const wanted = cookieStore.get("post_login_redirect")?.value;
    cookieStore.delete("post_login_redirect");

    return NextResponse.redirect(`${origin}${safePath(wanted) ?? "/dashboard"}`);
  } catch (e) {
    console.error("Auth callback error:", e);
    return NextResponse.redirect(`${origin}/register?error=auth`);
  }
}
