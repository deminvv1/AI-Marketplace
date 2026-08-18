import type { Locale } from "./routing";

/** Display metadata for the language pickers. Order matches routing.locales. */
export const LOCALE_OPTIONS: { code: Locale; label: string; native: string; flag: string; rtl?: boolean }[] = [
  { code: "en", label: "English",          native: "EN", flag: "🇺🇸" },
  { code: "ru", label: "Русский",          native: "RU", flag: "🇷🇺" },
  { code: "zh", label: "中文",              native: "ZH", flag: "🇨🇳" },
  { code: "de", label: "Deutsch",          native: "DE", flag: "🇩🇪" },
  { code: "es", label: "Español",          native: "ES", flag: "🇪🇸" },
  { code: "fr", label: "Français",         native: "FR", flag: "🇫🇷" },
  { code: "tr", label: "Türkçe",           native: "TR", flag: "🇹🇷" },
  { code: "hi", label: "हिन्दी",             native: "HI", flag: "🇮🇳" },
  { code: "pt", label: "Português",        native: "PT", flag: "🇧🇷" },
  { code: "ar", label: "العربية",           native: "AR", flag: "🇸🇦", rtl: true },
  { code: "ja", label: "日本語",            native: "JA", flag: "🇯🇵" },
  { code: "id", label: "Bahasa Indonesia", native: "ID", flag: "🇮🇩" },
];

export type { Locale };
