import { fetchSpecialists } from "@/lib/catalog";
import BrowseClient from "./browse-client";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { items, apiError } = await fetchSpecialists({ q });

  // В журнале сервера, чтобы сбой был виден без открытия страницы.
  if (apiError) console.error("[browse] catalogue unavailable:", apiError);

  return <BrowseClient initialItems={items} apiError={apiError} />;
}
