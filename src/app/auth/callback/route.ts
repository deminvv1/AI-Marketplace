import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/register?error=auth`);
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          profile: { create: {} },
          privacy: { create: {} },
        },
      });
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    if (!dbUser.onboardingCompleted) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (e) {
    console.error("Auth callback error:", e);
    return NextResponse.redirect(`${origin}/register?error=auth`);
  }
}
