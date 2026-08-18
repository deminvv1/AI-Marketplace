import type { MetadataRoute } from "next";
import { locales, routing } from "@/i18n/routing";
import { SITE_URL, localeUrl } from "@/lib/seo";

/** Locale-independent public paths. "" is the home page. Auth pages are noindex. */
const PUBLIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "",                 priority: 1.0, changeFrequency: "weekly" },
  { path: "/browse",          priority: 0.9, changeFrequency: "daily" },
  { path: "/hire",            priority: 0.9, changeFrequency: "weekly" },
  { path: "/work",            priority: 0.9, changeFrequency: "weekly" },
  { path: "/why-ai-market",   priority: 0.8, changeFrequency: "monthly" },
  { path: "/about",           priority: 0.7, changeFrequency: "monthly" },
  { path: "/help",            priority: 0.7, changeFrequency: "monthly" },
  { path: "/careers",         priority: 0.5, changeFrequency: "monthly" },
  { path: "/press",           priority: 0.4, changeFrequency: "monthly" },
  { path: "/terms",           priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy",  priority: 0.3, changeFrequency: "yearly" },
];

/** Catalogue categories — each is a real, indexable listing page. */
const BROWSE_CATEGORIES = [
  "AI & Automation", "Programming & Tech", "Data Science & ML", "Design & Creative",
  "Marketing & Growth", "Writing & Content", "Video & Animation", "Business & Support",
  "Music & Audio", "Industry Solutions", "Healthcare AI", "FinTech & Finance AI",
  "Manufacturing & Industry 4.0", "Legal AI & LegalTech", "Agriculture & Precision Farming AI",
  "Energy & Environment AI", "Logistics & Transportation AI", "Real Estate PropTech AI",
  "Retail & E-Commerce AI", "EdTech & E-Learning AI", "Research & Science AI",
  "HR & Recruitment AI", "Cybersecurity AI", "Photography & Image AI",
  "End-to-End Projects", "Service Catalog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of PUBLIC_PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = localeUrl(locale, path);
    }
    languages["x-default"] = localeUrl(routing.defaultLocale, path);

    // One entry per locale, each listing the full alternate set — this is what
    // makes the hreflang cluster reciprocal, which Google requires.
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified,
        changeFrequency,
        priority,
        alternates: { languages },
      });
    }
  }

  for (const category of BROWSE_CATEGORIES) {
    const suffix = `/browse?category=${encodeURIComponent(category)}`;
    const languages: Record<string, string> = {};
    for (const locale of locales) languages[locale] = localeUrl(locale, suffix);
    languages["x-default"] = localeUrl(routing.defaultLocale, suffix);
    for (const locale of locales) {
      entries.push({
        url: localeUrl(locale, suffix),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages },
      });
    }
  }

  return entries;
}

export const dynamic = "force-static";
