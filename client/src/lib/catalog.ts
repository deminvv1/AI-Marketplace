import type { FreelancerListItem } from "@/app/actions/freelancers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type CatalogFetch = {
  items: FreelancerListItem[];
  /** Заполняется, если API недоступен или ответил ошибкой. */
  apiError: string | null;
};

/**
 * Запрос к каталогу с сервера, без заголовка авторизации, — API отдаёт
 * обезличенные карточки, то есть ровно то, что должен видеть гость и робот
 * поисковика. Именно это кладёт настоящие карточки в разметку страницы.
 *
 * Недоступный API и пустой каталог выглядят для посетителя одинаково, поэтому
 * сбой возвращается отдельным полем.
 */
export async function fetchSpecialists(
  params: { q?: string; category?: string } = {},
): Promise<CatalogFetch> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  const qs = search.toString();
  const url = `${API_URL}/freelancers${qs ? `?${qs}` : ""}`;

  try {
    const res = await fetch(url, {
      // Каталог меняется медленно; короткий кэш удешевляет обходы роботами.
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { items: [], apiError: `API responded ${res.status} for ${url}` };

    const data = await res.json();
    if (!Array.isArray(data)) {
      return { items: [], apiError: `API returned an unexpected payload for ${url}` };
    }
    return { items: data, apiError: null };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { items: [], apiError: `Could not reach ${url} — ${reason}` };
  }
}
