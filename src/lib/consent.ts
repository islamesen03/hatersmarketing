/**
 * Visitor consent, kept in localStorage (strictly necessary, no cookie).
 * Optional categories stay OFF until the visitor turns them on, and can be
 * changed at any time from the footer ("Çerez tercihleri").
 */

export type Consent = {
  version: 1;
  analytics: boolean;
  decidedAt: string;
};

const KEY = "hm-consent";
const CHANGE = "hm:consent-change";
export const OPEN_SETTINGS = "hm:open-consent";

/** Optional tracking exists only when an analytics provider is configured. */
export const analyticsConfigured = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

let cached: Consent | null | undefined;

function read(): Consent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function getConsent(): Consent | null {
  if (cached === undefined) cached = read();
  return cached;
}

export function getServerConsent(): Consent | null {
  return null;
}

export function saveConsent(analytics: boolean) {
  const value: Consent = { version: 1, analytics, decidedAt: new Date().toISOString() };
  cached = value;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage blocked (private mode): the choice still applies for this visit.
  }
  window.dispatchEvent(new Event(CHANGE));
}

export function subscribeConsent(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === KEY) {
      cached = read();
      callback();
    }
  }
  window.addEventListener(CHANGE, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS));
}

export function hasAnalyticsConsent() {
  return analyticsConfigured && getConsent()?.analytics === true;
}
