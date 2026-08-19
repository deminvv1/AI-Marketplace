import { SITE_URL, localeUrl } from "@/lib/seo";

/**
 * Разметка для Google и Яндекса — описание сайта на языке, который понимают
 * поисковики. Даёт поиск по каталогу прямо из выдачи и раскрытые вопросы-ответы.
 *
 * Правило жёсткое: сюда попадает только то, что правда и что видно на самой
 * странице. За выдуманные данные в разметке поисковики наказывают сильнее,
 * чем за её отсутствие.
 */

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Данные наши, не пользовательские; < экранируем на случай вложенных тегов.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationSchema({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "AI Marketplace",
        url: localeUrl(locale, ""),
        description,
        logo: `${SITE_URL}/logo.png`,
      }}
    />
  );
}

export function WebSiteSchema({ locale }: { locale: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "AI Marketplace",
        url: localeUrl(locale, ""),
        inLanguage: locale,
        // Поиск по каталогу прямо из выдачи Google.
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${localeUrl(locale, "/browse")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function FaqSchema({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      }}
    />
  );
}

/**
 * Путь до страницы. Google показывает его в выдаче вместо голого адреса:
 * «aimarketplace.io › Каталог › Данные и аналитика» читается человеком, а
 * длинная ссылка — нет.
 */
export function BreadcrumbSchema({
  locale,
  trail,
}: {
  locale: string;
  trail: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map(({ name, path }, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name,
          item: localeUrl(locale, path),
        })),
      }}
    />
  );
}
