import type { LeadInput } from "./lead";
import { budgetOptions, UNSURE } from "./lead";
import { services } from "@/content/services";

/**
 * Delivers a validated lead to every configured channel. Nothing is stored on this
 * server. Channels (all optional, configured via environment variables):
 *
 *   LEAD_WEBHOOK_URL      POST JSON to a CRM / automation webhook (HubSpot, Make, Zapier, n8n…)
 *   LEAD_WEBHOOK_SECRET   sent as the `X-Webhook-Secret` header
 *
 *   RESEND_API_KEY        send an e-mail through Resend (https://resend.com)
 *   LEAD_EMAIL_TO         comma-separated recipients
 *   LEAD_EMAIL_FROM       verified sender, e.g. "Haters Marketing <form@alanadi.com>"
 *
 * The form reports success ONLY when at least one channel accepted the lead.
 */

export type DeliveryResult = "sent" | "not_configured" | "failed";

const serviceName = new Map<string, string>([
  ...services.map((s) => [s.slug, s.name] as [string, string]),
  [UNSURE, "Henüz emin değilim"],
]);

function describe(lead: LeadInput) {
  const budget = budgetOptions.find((o) => o.value === lead.budget)?.label ?? "Belirtilmedi";
  return [
    ["Ad soyad", lead.name],
    ["Şirket / marka", lead.company],
    ["E-posta", lead.email],
    ["Telefon", lead.phone || "—"],
    ["Web sitesi", lead.website || "—"],
    ["İlgilenilen hizmetler", lead.services.map((s) => serviceName.get(s) ?? s).join(", ")],
    ["Aylık reklam bütçesi", budget],
    ["Brif", lead.brief],
  ] as const;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendWebhook(url: string, lead: LeadInput, submittedAt: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.LEAD_WEBHOOK_SECRET) headers["X-Webhook-Secret"] = process.env.LEAD_WEBHOOK_SECRET;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "lead", source: "website", submittedAt, lead }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
}

async function sendEmail(lead: LeadInput) {
  const rows = describe(lead);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd">${escapeHtml(k)}</th><td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_EMAIL_FROM,
      to: (process.env.LEAD_EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: lead.email,
      subject: `Yeni brif: ${lead.company} — ${lead.name}`.slice(0, 180),
      text,
      html,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Resend responded ${response.status}`);
}

export async function deliverLead(lead: LeadInput): Promise<DeliveryResult> {
  const submittedAt = new Date().toISOString();
  const tasks: Promise<void>[] = [];

  if (process.env.LEAD_WEBHOOK_URL) tasks.push(sendWebhook(process.env.LEAD_WEBHOOK_URL, lead, submittedAt));
  if (process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO && process.env.LEAD_EMAIL_FROM)
    tasks.push(sendEmail(lead));

  if (tasks.length === 0) return "not_configured";

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    // Log the failure reason only — never the visitor's personal data.
    if (result.status === "rejected") console.error("[lead] delivery channel failed:", String(result.reason));
  }
  return results.some((r) => r.status === "fulfilled") ? "sent" : "failed";
}
