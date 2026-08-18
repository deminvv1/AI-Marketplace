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
    title: t("careersTitle"),
    description: t("careersDesc"),
    ...publicPageMetadata(locale, "/careers"),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
