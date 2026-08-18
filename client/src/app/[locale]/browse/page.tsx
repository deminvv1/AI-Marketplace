import type { FreelancerListItem } from "@/app/actions/freelancers";
import BrowseClient from "./browse-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CatalogFetch = {
  items: FreelancerListItem[];
  /** Set when the API could not be reached or answered with an error. */
  apiError: string | null;
};

/**
 * Fetched on the server, without an Authorization header, so the API returns
 * the anonymised cards — exactly what a guest and a crawler should see. Doing
 * it here rather than in the browser is what puts real listings into the HTML.
 *
 * An unreachable API and a genuinely empty catalogue look identical to the
 * visitor unless we say which happened, so the failure is reported separately.
 */
async function fetchSpecialists(q?: string): Promise<CatalogFetch> {
  const search = q ? `?q=${encodeURIComponent(q)}` : "";
  const url = `${API_URL}/freelancers${search}`;
  try {
    const res = await fetch(url, {
      // Listings change slowly; a short cache keeps crawls cheap.
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return { items: [], apiError: `API responded ${res.status} for ${url}` };
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return { items: [], apiError: `API returned an unexpected payload for ${url}` };
    }
    return { items: data, apiError: null };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { items: [], apiError: `Could not reach ${url} — ${reason}` };
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { items, apiError } = await fetchSpecialists(q);

  // Surfaced in the server log so an outage is visible without opening the page.
  if (apiError) console.error("[browse] catalogue unavailable:", apiError);

  return <BrowseClient initialItems={items} apiError={apiError} />;
}
