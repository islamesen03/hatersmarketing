import { parseLead, type LeadResponse } from "@/lib/lead";
import { deliverLead } from "@/lib/lead-delivery";
import { rateLimit } from "@/lib/rate-limit";
import { serviceOptions } from "@/content/services";

const MAX_BODY_BYTES = 20_000;
const MIN_FILL_MS = 2_500;

function reply(body: LeadResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function isCrossSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true; // "null" or malformed origin
  }
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  // Same-origin only: browsers always send Origin on cross-site POSTs.
  if (isCrossSite(request)) return reply({ ok: false, code: "bad_request" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ ok: false, code: "bad_request" }, 415);
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return reply({ ok: false, code: "bad_request" }, 413);

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("not an object");
  } catch {
    return reply({ ok: false, code: "bad_request" }, 400);
  }

  // Honeypot: a field people never see. Bots that fill it get a quiet 200 and nothing is sent.
  if (typeof raw.hm_extra === "string" && raw.hm_extra.trim() !== "") {
    return reply({ ok: true }, 200);
  }

  // Forms filled faster than a human can type are asked to retry (never faked as success).
  const startedAt = Number(raw.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return reply({ ok: false, code: "too_fast" }, 400);
  }

  if (!rateLimit(`lead:${clientIp(request)}`).allowed) {
    return reply({ ok: false, code: "rate_limited" }, 429);
  }

  const parsed = parseLead(raw, { serviceValues: serviceOptions.map((o) => o.value) });
  if (!parsed.ok) return reply({ ok: false, code: "invalid", errors: parsed.errors }, 422);

  const result = await deliverLead(parsed.data);
  if (result === "sent") return reply({ ok: true }, 200);
  if (result === "not_configured") return reply({ ok: false, code: "not_configured" }, 503);
  return reply({ ok: false, code: "delivery_failed" }, 502);
}
