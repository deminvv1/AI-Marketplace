import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SITE_URL, pageAlternates, localeUrl, OG_IMAGE } from "@/lib/seo";
import { HtmlLangSync } from "@/components/html-lang-sync";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  // Applies to the home page. Each nested route declares its own canonical in
  // its own layout.tsx — otherwise every page would canonicalise to the home page.
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: pageAlternates(locale, ""),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
      locale,
      url: localeUrl(locale, ""),
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Свой поставщик переводов на уровне языкового сегмента.
  //
  // В корневом макете он тоже есть — ради страниц кабинета, которые живут вне
  // /[locale]. Но корневой макет при переходе с /ru на /de не перерисовывается,
  // и тексты оставались на прежнем языке до перезагрузки страницы. Этот
  // поставщик перерисовывается вместе с сегментом и перекрывает корневой.
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangSync locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
