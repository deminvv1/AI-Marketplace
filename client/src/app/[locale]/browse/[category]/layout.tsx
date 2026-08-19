import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { categoryBySlug } from "@/lib/categories";
import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = categoryBySlug(category);
  if (!cat) return {};

  const t = await getTranslations({ locale, namespace: "catalog" });
  const tHire = await getTranslations({ locale, namespace: "hire" });
  const name = tHire(cat.nameKey);

  return {
    title: t("metaTitle", { category: name }),
    description: t("metaDesc", { category: name }),
    ...publicPageMetadata(locale, `/browse/${category}`),
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  // Неизвестная категория — честная 404, а не пустая страница: иначе поисковик
  // проиндексирует бесконечное число несуществующих адресов.
  if (!categoryBySlug(category)) notFound();
  return children;
}
