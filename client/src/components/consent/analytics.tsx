"use client";

import Script from "next/script";
import { useConsent } from "./consent-context";

/**
 * Yandex.Metrica and Google Analytics — loaded ONLY after the visitor has
 * agreed to the analytics category. Rendering nothing until then is the whole
 * point: a counter that loads before consent makes the banner decorative.
 *
 * Both IDs come from the environment, so nothing loads until they are set.
 */
export function Analytics() {
  const { consent } = useConsent();

  const ym = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  if (!consent?.analytics) return null;
  if (!ym && !ga) return null;

  return (
    <>
      <Script id="analytics-flag" strategy="afterInteractive">
        {`window.__analyticsLoaded = true;`}
      </Script>

      {ym && (
        <Script id="yandex-metrica" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${JSON.stringify(ym)}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
          `}
        </Script>
      )}

      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(ga)}, { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
