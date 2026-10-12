/**
 * Small in-memory sliding-window limiter. It protects a single server instance;
 * on serverless or multi-instance hosting, add a shared store (e.g. Redis/Upstash)
 * or the platform's firewall rules. See README → "Form koruması".
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { limit = 5, windowMs = 10 * 60_000 } = {}) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { allowed: false };
  }
  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return { allowed: true };
}
