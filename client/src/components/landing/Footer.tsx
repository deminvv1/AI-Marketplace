"use client";

import Link from "next/link";
import { CookieSettingsLink } from "@/components/consent/cookie-banner";
import { useTranslations, useLocale } from "next-intl";

// ── Inline SVG brand icons ────────────────────────────────────────────────────
const SocialFacebook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const SocialLinkedin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const SocialX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const SocialYoutube = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0b1220"/></svg>
);
const SocialInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

const SOCIAL = [
  { icon: SocialLinkedin, label: "LinkedIn",  href: "#" },
  { icon: SocialX,        label: "X",         href: "#" },
  { icon: SocialYoutube,  label: "YouTube",   href: "#" },
  { icon: SocialInstagram,label: "Instagram", href: "#" },
  { icon: SocialFacebook, label: "Facebook",  href: "#" },
];

const CATEGORIES = [
  "AI & Automation", "Programming & Tech", "Data Science & ML", "Design & Creative",
  "Marketing & Growth", "Writing & Content", "Video & Animation", "Business & Support",
  "Music & Audio", "Industry Solutions", "Healthcare AI", "FinTech & Finance AI",
  "Manufacturing & Industry 4.0", "Legal AI & LegalTech", "Agriculture & Precision Farming AI",
  "Energy & Environment AI", "Logistics & Transportation AI", "Real Estate PropTech AI",
  "Retail & E-Commerce AI", "EdTech & E-Learning AI", "Research & Science AI",
  "HR & Recruitment AI", "Cybersecurity AI", "Photography & Image AI",
  "End-to-End Projects", "Service Catalog",
];

type FooterLink = { label: string; href: string };

function FooterCol({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 style={{ fontSize: "0.7rem", color: "#8b93a7", fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: "1.15rem" }}>
        {heading}
      </h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="footer-link">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  // Public pages live under /[locale] and need the prefix. App routes (/search,
  // /forum) sit outside it and must stay unprefixed.
  const p = locale === "en" ? "" : `/${locale}`;

  const FOR_CLIENTS: FooterLink[] = [
    { label: t("findSpecialist"),    href: `${p}/browse` },
    { label: t("browseByCategory"),  href: `${p}/hire` },
    { label: t("postProject"),       href: `${p}/register` },
    { label: t("safetyTrust"),       href: `${p}/about#trust` },
  ];
  const FOR_SPECIALISTS: FooterLink[] = [
    { label: t("findProjects"),      href: "/search" },
    { label: t("projectCategories"), href: `${p}/work` },
    { label: t("becomeSpecialist"),  href: `${p}/register` },
    { label: t("waysToEarn"),        href: `${p}/why-ai-market` },
  ];
  const COMMUNITY: FooterLink[] = [
    { label: t("communityForum"),    href: "/forum" },
    { label: t("helpCenter"),        href: `${p}/help` },
    { label: t("howItWorks"),        href: `${p}/about#how-it-works` },
  ];
  const COMPANY: FooterLink[] = [
    { label: t("aboutUs"),           href: `${p}/about` },
    { label: t("careers"),           href: `${p}/careers` },
    { label: t("press"),             href: `${p}/press` },
  ];
  const LEGAL: FooterLink[] = [
    { label: t("terms"),             href: `${p}/terms` },
    { label: t("privacy"),           href: `${p}/privacy-policy` },
  ];

  return (
    <footer style={{ background: "#0b1220", fontFamily: "system-ui, -apple-system, Arial, sans-serif" }}>
      <style>{`
        .footer-link {
          font-size: 0.83rem; color: #c3cad8; text-decoration: none; line-height: 1.5;
          transition: color 0.15s ease;
        }
        .footer-link:hover { color: #fff; }
        .footer-link:focus-visible { outline: 2px solid #a78bfa; outline-offset: 3px; border-radius: 2px; }
        .footer-social:hover { color: #fff !important; }
        .footer-cookie-settings { font-size: 0.74rem; color: #8b93a7; }
        .footer-cookie-settings:hover { color: #fff; }
        .footer-cookie-settings:focus-visible { outline: 2px solid #a78bfa; outline-offset: 3px; border-radius: 2px; }
        /* Четыре равные колонки: раньше первая была шире остальных под
           длинный список категорий, и колонки не выравнивались между собой. */
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2.5rem 2rem;
        }
        /* Категории лентой над колонками — ровными столбцами, а не рваным
           потоком: так глаз читает список сверху вниз, как в колонке. */
        .footer-cats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
          gap: 0.75rem 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        @media (max-width: 767px) {
          .footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2.25rem 1.5rem; }
          /* Двадцать шесть категорий в один столбец растягивают футер почти на
             тысячу пикселей. Скрывать их нельзя — при мобильной индексации
             ссылки со скрытых блоков весят меньше, поэтому просто ужимаем. */
          .footer-cats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.6rem 1.1rem;
            font-size: 0.78rem;
          }
        }
        @media (max-width: 419px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "64px 24px 0" }}>
        {/* Категории — лентой во всю ширину над колонками. Раньше они жили
            одной левой колонкой в 26 строк, из-за чего футер выглядел
            перекошенным. */}
        <div style={{ paddingBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "0.7rem", color: "#8b93a7", fontWeight: 600, letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: "1.15rem" }}>
            {t("categories")}
          </h2>
          <ul className="footer-cats">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`${p}/browse?category=${encodeURIComponent(c)}`} className="footer-link">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="footer-grid"
          style={{ paddingBottom: "3rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <FooterCol heading={t("forClients")}     links={FOR_CLIENTS} />
          <FooterCol heading={t("forSpecialists")} links={FOR_SPECIALISTS} />
          <FooterCol heading={t("community")}      links={COMMUNITY} />
          <FooterCol heading={t("company")}        links={COMPANY} />
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "28px 0 36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <Link href={p || "/"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#14a800"/>
                <circle cx="16" cy="9" r="2.6" fill="white"/><circle cx="9" cy="23" r="2.6" fill="white"/><circle cx="23" cy="23" r="2.6" fill="white"/>
                <line x1="16" y1="9" x2="9" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="16" y1="9" x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="9" y1="23" x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", letterSpacing: "-0.02em" }}>
                AI <span style={{ color: "#a78bfa" }}>Marketplace</span>
              </span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label} className="footer-social" style={{ color: "#7b839a", display: "inline-flex", transition: "color 0.15s ease" }}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
            <span style={{ fontSize: "0.74rem", color: "#5f677b" }}>{t("copyright")}</span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              {LEGAL.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ fontSize: "0.74rem", color: "#8b93a7", textDecoration: "none" }}>{label}</Link>
                </li>
              ))}
              {/* Withdrawing consent has to be as easy as giving it. */}
              <li>
                <CookieSettingsLink className="footer-cookie-settings" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
