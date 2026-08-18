export type LegalSection = { title: string; body: string };
export type LegalDocs = { terms: LegalSection[]; privacy: LegalSection[] };

/**
 * Single place to change the contact address once a working mailbox exists.
 * Until the domain is live these addresses do not receive mail.
 */
export const LEGAL_EMAIL = "privacy@aimarketplace.io";
export const LEGAL_UPDATED = "18 August 2026";
export const LEGAL_UPDATED_RU = "18 августа 2026";
