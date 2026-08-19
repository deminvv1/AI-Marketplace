import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { categoryBySlug } from "@/lib/categories";
import { SKILL_KEYS } from "@/lib/skill-keys";
import { fetchSpecialists } from "@/lib/catalog";
import { routing } from "@/i18n/routing";

/**
 * Посадочная страница направления.
 *
 * Смысл её существования — собственный адрес и собственное содержимое: раньше
 * категории жили в параметре адреса, все отдавали одну и ту же разметку, и для
 * поисковика это были копии каталога. Здесь у каждой свой заголовок, свой
 * список ролей и свои люди, полученные с сервера — робот видит готовую
 * страницу, а не пустую заготовку.
 */
// Собрать страницу заранее нельзя: язык интерфейса определяется в том числе по
// cookie, а обращение к ней делает отрисовку динамической. Кэш самого запроса к
// каталогу (300 секунд) остаётся, поэтому обходы роботом остаются дешёвыми.

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const cat = categoryBySlug(category)!;

  const t = await getTranslations({ locale, namespace: "catalog" });
  const tHire = await getTranslations({ locale, namespace: "hire" });
  const tSkills = await getTranslations({ locale, namespace: "skills" });
  const name = tHire(cat.nameKey);

  const { items } = await fetchSpecialists({ category: cat.slug });

  const p = locale === routing.defaultLocale ? "" : `/${locale}`;
  const isRtl = locale === "ar";

  // Подпись роли переводим, а в поиск отправляем английское название — иначе
  // на других языках каталог перестанет находить людей.
  const roleLabel = (skill: string) => {
    const key = SKILL_KEYS[skill];
    return key ? tSkills(key) : skill;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <section style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", padding: "120px 24px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href={`${p}/browse`} style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", textDecoration: "none", letterSpacing: "0.04em" }}>
            ← {t("allCategories")}
          </Link>
          <h1 style={{ fontSize: "clamp(2rem,5vw,2.9rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", margin: "16px 0 18px" }}>
            {t("heading", { category: name })}
          </h1>
          <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, maxWidth: 660 }}>
            {t("intro", { category: name })}
          </p>
        </div>
      </section>

      {/* Роли направления: главное содержимое страницы и внутренние ссылки. */}
      <section style={{ padding: "64px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.02em" }}>
            {t("rolesTitle")}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: 26 }}>{t("rolesHint")}</p>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))", gap: "0.7rem 1.5rem" }}>
            {cat.skills.map((skill) => (
              <li key={skill}>
                <Link
                  href={`${p}/browse?q=${encodeURIComponent(skill)}`}
                  style={{ fontSize: "0.9rem", color: "#4338ca", textDecoration: "none", lineHeight: 1.6 }}
                >
                  {roleLabel(skill)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: "0 24px 88px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: 24, letterSpacing: "-0.02em" }}>
            {t("peopleTitle")}
          </h2>

          {items.length === 0 ? (
            /* Пусто — говорим об этом прямо, а не рисуем видимость наполненности. */
            <p style={{ fontSize: "0.95rem", color: "#6b7280", lineHeight: 1.75, maxWidth: 620 }}>
              {t("empty")}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
              {items.map((item) => (
                <li key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, background: "#fafafa" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>
                    {item.profile?.specialization ?? name}
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "#6b7280", marginTop: 6 }}>
                    {item.profile?.country ?? ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
