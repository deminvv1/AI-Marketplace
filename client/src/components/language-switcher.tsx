"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { LOCALES, useI18n, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-9 grid place-items-center rounded-lg bg-white/5 border border-border hover:border-primary/50 transition text-sm"
        aria-label="Change language"
        title={current.label}
      >
        <Globe className="size-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => pick(l.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                locale === l.code
                  ? "bg-primary/15 text-foreground"
                  : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {locale === l.code && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
