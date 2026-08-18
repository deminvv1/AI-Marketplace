import { NextResponse } from "next/server";

/**
 * Diagnostics for the deployment: says whether the frontend can actually reach
 * the NestJS API, and how many specialists that API returns to a guest.
 *
 * Exists because an unreachable API and an empty database look identical from
 * the catalogue page. Open /api/health to tell them apart.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || null;
  const target = `${apiUrl ?? "http://localhost:4000/api"}/freelancers`;

  const started = Date.now();
  let api: Record<string, unknown>;

  try {
    const res = await fetch(target, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const ms = Date.now() - started;

    if (!res.ok) {
      api = { reachable: true, ok: false, status: res.status, ms };
    } else {
      const body = await res.json().catch(() => null);
      api = {
        reachable: true,
        ok: true,
        status: res.status,
        ms,
        specialists: Array.isArray(body) ? body.length : null,
        anonymised: Array.isArray(body) && body.length > 0 ? body[0]?.anonymous === true : null,
      };
    }
  } catch (e) {
    api = {
      reachable: false,
      ms: Date.now() - started,
      reason: e instanceof Error ? e.message : String(e),
    };
  }

  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      env: {
        // Only whether they are set — never the values themselves.
        // NEXT_PUBLIC_* values ship inside the browser bundle anyway, so echoing
        // the API host here leaks nothing that visitors cannot already read.
        NEXT_PUBLIC_API_URL: apiUrl ?? "MISSING (falling back to localhost:4000)",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "set" : "MISSING",
      },
      api,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
