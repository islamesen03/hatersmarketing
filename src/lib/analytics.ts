import { hasAnalyticsConsent } from "./consent";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends an event only after analytics consent. Without consent (or without a
 * configured provider) this is a no-op: nothing is queued, nothing is stored.
 *
 * Events: cta_click, lead_submit_success, lead_submit_error, service_view, contact_click
 */
export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  window.gtag?.("event", event, params);
}
