import type { Provider } from "@supabase/supabase-js";

/**
 * Sign-in providers to offer, comma-separated, e.g. "google,yandex".
 * Only list providers actually configured in Supabase — a listed but
 * unconfigured provider fails at redirect time.
 */
const ENABLED = (process.env.NEXT_PUBLIC_OAUTH_PROVIDERS ?? "google")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export type ProviderOption = {
  id: string;
  /** Value passed to signInWithOAuth. Custom providers use the `custom:` prefix. */
  provider: Provider | `custom:${string}`;
  name: string;
  mark: string;
  brand: string;
};

const ALL: ProviderOption[] = [
  { id: "google", provider: "google", name: "Google", mark: "G", brand: "#4285F4" },
  // Yandex is not a built-in Supabase provider — it is wired up as a custom
  // OAuth2 provider (authorize/token/userinfo endpoints of Yandex ID).
  { id: "yandex", provider: "custom:yandex", name: "Yandex", mark: "Я", brand: "#FC3F1D" },
];

export const PROVIDERS: ProviderOption[] = ALL.filter((p) => ENABLED.includes(p.id));
