import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Canonical origin for the site.
 *
 * Must be the host that actually serves the pages. A canonical pointing at a
 * domain that is not delegated to this deployment tells search engines to index
 * that other host instead — so keep this in sync with DNS.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aimarketplace.io"
).replace(/\/$/, "");

/** Absolute URL of `path` in `locale`. English carries no prefix. */
export function localeUrl(locale: string, path = ""): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

/**
 * Canonical + hreflang set for one public page.
 *
 * `path` is the locale-independent pathname, e.g. "/careers" ("" for the home
 * page). Every page needs its own — a single canonical declared once in the
 * layout would point every page at the same URL, which reads as "these are all
 * duplicates of the home page".
 */
export function pageAlternates(locale: string, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = localeUrl(loc, path);
  }
  languages["x-default"] = localeUrl(routing.defaultLocale, path);

  return {
    canonical: localeUrl(locale, path),
    languages,
  };
}

/** Metadata for a public page: correct canonical, hreflang and OG url. */
export function publicPageMetadata(locale: string, path = ""): Metadata {
  return {
    alternates: pageAlternates(locale, path),
    openGraph: { url: localeUrl(locale, path) },
  };
}
