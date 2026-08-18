import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { publicPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("helpTitle"),
    description: t("helpDesc"),
    ...publicPageMetadata(locale, "/help"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
