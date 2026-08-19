"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_OPTIONS, type Locale } from "@/i18n/locales";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find((l) => l.code === locale) ?? LOCALE_OPTIONS[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(code: Locale) {
    setOpen(false);
    // next-intl запоминает выбор в своей cookie и сохраняет текущий путь.
    router.replace(pathname, { locale: code });

    // Страницы кабинета живут вне сегмента /[locale], поэтому язык им раздаёт
    // корневой макет — а он при таком переходе не перерисовывается, и тексты
    // остались бы на прежнем языке. refresh() перезапрашивает серверную часть
    // без полной перезагрузки страницы: без белого экрана и без потери места
    // прокрутки. На публичных страницах этого не нужно — там переводы
    // раздаёт макет языкового сегмента, который перерисовывается сам.
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          h-9 px-2.5 flex items-center gap-1.5 rounded-lg border text-sm font-medium
          transition-all duration-200 select-none
          ${open
            ? "bg-primary/15 border-primary/50 text-foreground"
            : "bg-muted/60 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }
        `}
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs tracking-wider font-semibold hidden sm:block">{current.native}</span>
        <ChevronDown
          className={`size-3 transition-transform duration-200 hidden sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 overflow-hidden z-50"
          style={{
            background: "rgba(10,10,20,0.94)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset",
          }}
        >
          <div className="p-1.5 space-y-0.5">
            {LOCALE_OPTIONS.map((l) => {
              const active = locale === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => pick(l.code)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150
                    ${active
                      ? "bg-primary/20 text-foreground"
                      : "text-muted-foreground hover:bg-white/6 hover:text-foreground"
                    }
                  `}
                >
                  <span className="text-lg leading-none w-6 text-center shrink-0">{l.flag}</span>
                  <span className="flex-1 text-left font-medium">{l.label}</span>
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">{l.native}</span>
                  {active && <Check className="size-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      )}
    </div>
  );
}
