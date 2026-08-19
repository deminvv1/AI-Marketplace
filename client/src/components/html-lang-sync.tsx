"use client";

import { useEffect } from "react";

const RTL_LOCALES = new Set(["ar"]);

/**
 * Держит атрибуты <html lang> и <html dir> в согласии с выбранным языком.
 *
 * Сам тег <html> находится в корневом макете, который при переходе с /ru на /de
 * не перерисовывается — без этой синхронизации страница осталась бы помечена
 * прежним языком, а арабский не развернулся бы справа налево до перезагрузки.
 */
export function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
