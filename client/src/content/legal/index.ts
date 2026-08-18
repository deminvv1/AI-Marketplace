import { EN } from "./en";
import { RU } from "./ru";
import type { LegalDocs } from "./types";

export { LEGAL_EMAIL, LEGAL_UPDATED, LEGAL_UPDATED_RU } from "./types";
export type { LegalSection } from "./types";

/**
 * Legal texts exist in Russian and English only. Other locales fall back to
 * English, and the page says so — a machine-translated contract would be worse
 * than an honest note.
 */
export function legalDocs(locale: string): { docs: LegalDocs; isFallback: boolean } {
  if (locale === "ru") return { docs: RU, isFallback: false };
  if (locale === "en") return { docs: EN, isFallback: false };
  return { docs: EN, isFallback: true };
}
