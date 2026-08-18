import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// next-intl handles locale detection + URL routing for public pages
const handleI18n = createMiddleware(routing);

// Routes that require authentication (no locale prefix)
const AUTH_PREFIXES = [
  "/dashboard", "/settings", "/messages", "/projects", "/proposals",
  "/profile", "/search", "/specialists", "/solutions", "/forum",
  "/saved", "/admin", "/project-alerts", "/onboarding",
];

// Legacy route redirects
const LEGACY: Record<string, string> = {
  "/orders": "/projects",
  "/post-order": "/projects/new",
  "/executors": "/specialists",
  "/freelancers": "/specialists",
  "/offers": "/solutions",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Legacy redirects ──────────────────────────────────────────────────────
  const legacy = LEGACY[pathname];
  if (legacy) return NextResponse.redirect(new URL(legacy, request.url));

  // ── Auth-required routes: Supabase session check ─────────────────────────
  const needsAuth = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if (needsAuth) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      // A guest stopped at a members-only page has NOT signed out — say so
      // honestly, and remember where they were heading.
      const res = NextResponse.redirect(new URL("/register?auth=required", request.url));
      res.cookies.set("post_login_redirect", pathname + request.nextUrl.search, {
        path: "/",
        maxAge: 1800,
        sameSite: "lax",
      });
      return res;
    }

    return supabaseResponse;
  }

  // ── Auth callback: always pass through ───────────────────────────────────
  if (pathname.startsWith("/auth") || pathname.startsWith("/welcome")) {
    return NextResponse.next();
  }

  // ── Public routes: next-intl handles locale detection + routing ───────────
  return handleI18n(request);
}

export const config = {
  matcher: [
    // sitemap.xml and robots.txt must be excluded: next-intl would treat them as
    // localisable paths and rewrite them to an HTML page, so crawlers get markup
    // instead of the feed.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
