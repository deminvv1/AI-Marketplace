/**
 * Cookie consent — shared vocabulary for the banner, the analytics loader and
 * the server layout.
 *
 * Only two categories exist, and that is deliberate: cookies the site cannot
 * work without (sign-in session, chosen language) and analytics. Necessary
 * cookies need no consent under ePrivacy/GDPR; analytics must not load before
 * the visitor agrees.
 */

export const CONSENT_COOKIE = "cookie_consent";

/** Bump when the categories change — an older stored choice then stops counting. */
export const CONSENT_VERSION = 1;

/** Consent expires so the question is asked again rather than assumed forever. */
export const CONSENT_MAX_AGE_DAYS = 180;

export type Consent = {
  version: number;
  /** Necessary cookies are implicit; only the optional category is recorded. */
  analytics: boolean;
  /** When the choice was made — evidence that consent was actually given. */
  ts: string;
};

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    return { version: CONSENT_VERSION, analytics: parsed.analytics, ts: String(parsed.ts ?? "") };
  } catch {
    return null;
  }
}

export function makeConsent(analytics: boolean): Consent {
  return { version: CONSENT_VERSION, analytics, ts: new Date().toISOString() };
}

export function consentCookieValue(consent: Consent): string {
  return encodeURIComponent(JSON.stringify(consent));
}
