import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { Providers } from "./providers";
import { ConsentProvider } from "@/components/consent/consent-context";
import { CookieBanner } from "@/components/consent/cookie-banner";
import { Analytics } from "@/components/consent/analytics";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import "@/styles.css";

const RTL_LOCALES = new Set(["ar"]);

export const viewport: Viewport = {
  themeColor: "#f8f8ff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AI Marketplace — Connect with AI specialists worldwide",
  description: "The first international platform uniting AI specialists and clients from around the world.",
  authors: [{ name: "AI Marketplace" }],
  openGraph: {
    title: "AI Marketplace",
    description: "Connect with AI specialists and clients worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@aimarketplace",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The <html> tag lives above the [locale] segment, so the locale comes from
  // the request (URL prefix or NEXT_LOCALE cookie) rather than route params.
  const locale = await getLocale();
  // Provided here rather than only under [locale] so that the signed-in app,
  // which lives outside the locale segment, is translated as well.
  const messages = await getMessages();
  // Read on the server so a visitor who already answered never sees the banner
  // flash on load.
  const consent = parseConsent((await cookies()).get(CONSENT_COOKIE)?.value);

  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ConsentProvider initial={consent}>
            <Providers>{children}</Providers>
            <CookieBanner />
            <Analytics />
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
