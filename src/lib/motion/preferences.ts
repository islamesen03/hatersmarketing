/**
 * Motion preference: the OS setting is the only source. A local "full motion" choice can
 * never override an OS reduce request, so there is nothing to persist here.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}

/** Subscribe to runtime changes of the OS preference. Returns an unsubscribe function. */
export function onReducedMotionChange(listener: (reduce: boolean) => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  const handler = (event: MediaQueryListEvent) => listener(event.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

/**
 * Constrained delivery: honour Save-Data when the browser exposes it. Optional layers
 * (tilt, idle settling) are skipped; the scenes themselves still run.
 */
export function prefersReducedData(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}
