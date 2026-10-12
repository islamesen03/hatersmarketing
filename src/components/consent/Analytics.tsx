"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { getConsent, getServerConsent, subscribeConsent } from "@/lib/consent";
import { track } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function clearAnalyticsCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    if (name && (name === "_ga" || name.startsWith("_ga_"))) {
      const host = window.location.hostname;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${host.replace(/^www\./, "")}`;
    }
  }
}

/**
 * Loads Google Analytics 4 only when a measurement ID is configured AND the
 * visitor has opted in. Revoking consent stops collection and clears _ga cookies.
 * Also forwards clicks on [data-track] elements as events (no-op without consent).
 */
export function Analytics() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  const granted = Boolean(GA_ID) && consent?.analytics === true;

  useEffect(() => {
    if (!GA_ID || consent === null) return;
    if (!consent.analytics) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      clearAnalyticsCookies();
    }
  }, [consent]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!target) return;
      track(target.dataset.track ?? "click", { label: target.dataset.trackLabel });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!granted) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
