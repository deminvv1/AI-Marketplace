import { defineRouting } from "next-intl/routing";

export const locales = [
  "en", "ru", "zh", "de", "es", "fr", "tr", "hi", "pt", "ar", "ja", "id",
] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed", // English = /, Russian = /ru, etc.
  localeDetection: true,     // Auto-detect from Accept-Language browser header
});
