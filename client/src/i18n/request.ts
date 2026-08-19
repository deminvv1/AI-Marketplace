import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

function isSupported(value?: string | null): value is (typeof routing.locales)[number] {
  return !!value && routing.locales.includes(value as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Под /[locale] язык задаёт сам адрес. Личный кабинет живёт вне этого
  // сегмента, поэтому там язык берётся из cookie, которую пишет переключатель, —
  // иначе внутренние страницы всегда открывались бы по-английски.
  const fromSegment = await requestLocale;

  // cookies() читаем ТОЛЬКО когда язык не удалось взять из адреса: само
  // обращение к cookie делает страницу динамической, и заранее собрать её уже
  // нельзя — сборка падает с DYNAMIC_SERVER_USAGE.
  let locale: string = routing.defaultLocale;
  if (isSupported(fromSegment)) {
    locale = fromSegment;
  } else {
    const fromCookie = (await cookies()).get("NEXT_LOCALE")?.value;
    if (isSupported(fromCookie)) locale = fromCookie;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
