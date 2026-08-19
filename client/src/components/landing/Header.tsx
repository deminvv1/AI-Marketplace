"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { CATEGORIES } from "@/lib/categories";
import { SKILL_KEYS } from "@/lib/skill-keys";
import { useRouter, usePathname } from "@/i18n/navigation";
import { usePathname as useRawPathname } from "next/navigation";

// ── Language switcher ─────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "ar", flag: "🇸🇦", label: "العربية" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
];

function LangSwitcher({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();       // locale-stripped path (next-intl)
  const rawPathname = useRawPathname(); // full URL path with locale prefix
  const router = useRouter();           // next-intl router (sets NEXT_LOCALE cookie)

  // Detect current locale from raw URL (works without NextIntlClientProvider)
  const seg = rawPathname.split("/")[1];
  const locale = LANG_OPTIONS.some((l) => l.code === seg) ? seg : "en";
  const current = LANG_OPTIONS.find((l) => l.code === locale) ?? LANG_OPTIONS[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function switchLocale(code: string) {
    setOpen(false);
    router.push(pathname, { locale: code });
  }

  const borderColor = dark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)";
  const bg = dark ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.1)";
  const textCol = dark ? "#374151" : "rgba(255,255,255,0.9)";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-sm font-medium transition-colors"
        style={{ border: `1px solid ${borderColor}`, background: bg, color: textCol }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:block text-xs font-semibold uppercase tracking-wide">{current.code}</span>
        <ChevronDown size={11} className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{ background: "rgba(8,8,20,0.96)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
        >
          <div className="p-1.5 grid grid-cols-1 gap-0.5 max-h-80 overflow-y-auto">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => switchLocale(l.code)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition-colors hover:bg-white/10"
                style={{ color: l.code === current.code ? "#a78bfa" : "rgba(255,255,255,0.8)", fontWeight: l.code === current.code ? 600 : 400 }}
              >
                <span className="text-lg w-6 text-center">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                <span className="text-xs opacity-40 uppercase">{l.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MegaMenuProps {
  onClose: () => void;
  footerLinks?: { label: string; href: string }[];
}

/**
 * Мега-меню поверх общего справочника направлений.
 *
 * Раньше здесь лежала третья копия списка: своя в шапке, своя на странице
 * «Найти специалиста», своя в футере — все на английском и все разные. Теперь
 * источник один, и подписи переведены на 12 языков вместе с ним.
 */
function MegaMenu({ onClose, footerLinks }: MegaMenuProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const t = useTranslations("nav");
  const tHire = useTranslations("hire");
  const tSkills = useTranslations("skills");
  const tFooter = useTranslations("footer");
  const tCatalog = useTranslations("catalog");
  const locale = useLocale();
  const p = locale === "en" ? "" : `/${locale}`;

  const active = CATEGORIES[activeIdx];

  // Подпись переводим, в поиск отправляем английское название роли — иначе
  // каталог перестанет находить людей на других языках.
  const roleLabel = (skill: string) => {
    const key = SKILL_KEYS[skill];
    return key ? tSkills(key) : skill;
  };

  return (
    <div
      className="absolute top-full left-0 mt-0 bg-white rounded-b-xl shadow-2xl border border-gray-100 flex overflow-hidden"
      style={{ width: 700, zIndex: 200, marginTop: 1 }}
    >
      {/* Left: category list */}
      <div className="w-52 border-r border-gray-100 py-4 flex-shrink-0 bg-gray-50/50">
        <div className="px-5 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {tFooter("categories")}
        </div>
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat.slug}
            className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-left transition-all"
            style={{
              background: activeIdx === idx ? "#fff" : "transparent",
              color: activeIdx === idx ? "#6366f1" : "#374151",
              fontWeight: activeIdx === idx ? 600 : 400,
              borderRight: activeIdx === idx ? "2px solid #6366f1" : "2px solid transparent",
            }}
            onMouseEnter={() => setActiveIdx(idx)}
          >
            {tHire(cat.nameKey)}
            <ChevronDown size={12} style={{ transform: "rotate(-90deg)", opacity: 0.4 }} />
          </button>
        ))}
      </div>

      {/* Right: roles of the active category */}
      <div className="flex-1 p-5">
        <Link
          href={`${p}/browse/${active.slug}`}
          onClick={onClose}
          className="block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3 hover:underline"
        >
          {tHire(active.nameKey)} · {tCatalog("peopleTitle")}
        </Link>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {active.skills.map((skill) => (
            <Link
              key={skill}
              href={`${p}/browse?q=${encodeURIComponent(skill)}`}
              onClick={onClose}
              className="block text-sm text-gray-700 hover:text-indigo-500 transition-colors leading-snug"
            >
              {roleLabel(skill)}
            </Link>
          ))}
        </div>
        {footerLinks && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-5">
            {footerLinks.map((fl) => (
              <Link
                key={fl.label}
                href={fl.href}
                onClick={onClose}
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                {fl.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"hire" | "work" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const openMenu = (menu: "hire" | "work") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(menu);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 120);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(null);
  };

  const dark = scrolled || mobileOpen;
  const textCol = dark ? "#111827" : "#ffffff";


  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: dark ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: dark ? "blur(20px)" : "none",
        boxShadow: dark ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-5 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 select-none" style={{ textDecoration: "none" }}>
          {/* Brand mark — network graph symbolising connections */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="32" height="32" rx="8" fill="#14a800"/>
            <circle cx="16" cy="9"  r="2.6" fill="white"/>
            <circle cx="9"  cy="23" r="2.6" fill="white"/>
            <circle cx="23" cy="23" r="2.6" fill="white"/>
            <line x1="16" y1="9"  x2="9"  y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="16" y1="9"  x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="9"  y1="23" x2="23" y2="23" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          {/* Wordmark */}
          <div style={{ lineHeight: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.08rem",
                letterSpacing: "-0.03em",
                background: "linear-gradient(130deg, #14a800 0%, #00c4a0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >AI</span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.08rem",
                letterSpacing: "-0.025em",
                color: dark ? "#111827" : "#ffffff",
                transition: "color 0.3s",
              }}
            >&nbsp;Marketplace</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 ml-4 flex-1">
          {/* Find Talent */}
          <div
            className="relative"
            onMouseEnter={() => openMenu("hire")}
            onMouseLeave={scheduleClose}
          >
            <button
              className="flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ color: textCol }}
            >
              {t("findTalent")}
              <ChevronDown
                size={13}
                style={{
                  opacity: 0.65,
                  transition: "transform 0.2s",
                  transform: activeMenu === "hire" ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {activeMenu === "hire" && (
              <div onMouseEnter={() => openMenu("hire")} onMouseLeave={scheduleClose}>
                <MegaMenu
                  onClose={closeMenu}
                  footerLinks={[{ label: t("seeAllSkills"), href: "/hire" }]}
                />
              </div>
            )}
          </div>

          {/* Find Work */}
          <div
            className="relative"
            onMouseEnter={() => openMenu("work")}
            onMouseLeave={scheduleClose}
          >
            <button
              className="flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium transition-colors"
              style={{ color: textCol }}
            >
              {t("findWork")}
              <ChevronDown
                size={13}
                style={{
                  opacity: 0.65,
                  transition: "transform 0.2s",
                  transform: activeMenu === "work" ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {activeMenu === "work" && (
              <div onMouseEnter={() => openMenu("work")} onMouseLeave={scheduleClose}>
                <MegaMenu
                  onClose={closeMenu}
                  footerLinks={[
                    { label: t("browseAllProjects"), href: "/work" },
                    { label: t("createProfile"), href: "/register" },
                  ]}
                />
              </div>
            )}
          </div>

          <Link
            href="/why-ai-market"
            className="px-3.5 py-2 rounded-md text-sm font-medium"
            style={{ color: textCol }}
          >
            {t("whyAiMarket")}
          </Link>
        </nav>

        {/* Right actions - desktop */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <LangSwitcher dark={dark} />
          <Link
            href="/register?skip_role=1"
            className="text-sm font-medium px-3 py-2 rounded-md transition-colors"
            style={{ color: textCol }}
          >
            {t("logIn")}
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              boxShadow: "0 1px 8px rgba(99,102,241,0.45)",
            }}
          >
            {t("signUp")}
          </Link>
        </div>

        {/* Mobile: right side. Below 360px the sign-up pill is dropped — the
            language switcher and the burger alone already fill the row, and
            sign-up stays reachable from the drawer. */}
        <div className="flex lg:hidden items-center gap-1.5 min-[400px]:gap-2 ml-auto min-w-0">
          <LangSwitcher dark={dark} />
          <Link href="/register" className="hidden min-[360px]:inline-block text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }}>
            {t("signUp")}
          </Link>
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="p-2 rounded-md transition-colors"
            style={{ color: textCol }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-1">
          {([
            { label: t("findTalent"),   href: "/hire" },
            { label: t("findWork"),     href: "/work" },
            { label: t("whyAiMarket"), href: "/why-ai-market" },
          ] as { label: string; href: string }[]).map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm font-medium text-gray-800 border-b border-gray-100"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 mt-3">
            <Link href="/register?skip_role=1" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700">
              {t("logIn")}
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-full text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {t("signUp")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
