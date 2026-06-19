"use server";

import type { Locale } from "@/lib/i18n";

const LOCALE_TO_LANG: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  zh: "zh-CN",
  de: "de",
  es: "es",
  fr: "fr",
  ar: "ar",
  hi: "hi",
};

export async function translateText(
  text: string,
  targetLocale: Locale,
): Promise<{ translated: string } | { error: string }> {
  if (!text.trim()) return { error: "Empty text" };

  const targetLang = LOCALE_TO_LANG[targetLocale] ?? "en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return { error: "Translation service unavailable" };
    const json = await res.json();
    const translated: string = json?.responseData?.translatedText ?? "";
    if (!translated) return { error: "No translation returned" };
    return { translated };
  } catch {
    return { error: "Network error" };
  }
}
