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

  // Адреса вида /browse?category=… в карту НЕ попадают.
  //
  // Фильтр по категории применяется в браузере, поэтому все 312 таких адресов
  // отдают одну и ту же разметку и один и тот же заголовок — для поисковика
  // это 312 копий каталога. Заявлять их в карте сайта значит просить
  // проиндексировать дубликаты.
  //
  // Правильное решение — настоящие страницы категорий по адресам вида
  // /browse/ai-developers, каждая со своим содержимым, заголовком и canonical.
  // Когда они появятся, вернуть их сюда.

  return entries;
}

export const dynamic = "force-static";
