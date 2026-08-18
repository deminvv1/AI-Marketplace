import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

function isSupported(value?: string | null): value is (typeof routing.locales)[number] {
  return !!value && routing.locales.includes(value as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Under /[locale] the segment decides. The signed-in app lives outside that
  // segment, so there we fall back to the cookie the language switcher writes —
  // otherwise every app page would render in English regardless of the choice.
  const fromSegment = await requestLocale;
  const fromCookie = (await cookies()).get("NEXT_LOCALE")?.value;

  const locale = isSupported(fromSegment)
    ? fromSegment
    : isSupported(fromCookie)
      ? fromCookie
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
