import { getTranslations } from "next-intl/server";
import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

/**
 * Каталог — самая ценная для поиска страница, и до этого у неё не было своих
 * метаданных: она наследовала заголовок и canonical главной, то есть сама
 * сообщала поисковику «я копия главной страницы».
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("browseTitle"),
    description: t("browseDesc"),
    ...publicPageMetadata(locale, "/browse"),
  };
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
