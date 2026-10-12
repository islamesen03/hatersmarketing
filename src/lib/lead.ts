/**
 * Lead (brief) form: one validator shared by the browser and the server.
 * Dependency-free on purpose, so it runs under `node --test` as well.
 */

export const UNSURE = "emin-degilim";

/** Editable ranges — see CONTENT_TO_CONFIRM.md. Empty value = "prefer not to say". */
export const budgetOptions = [
  { value: "", label: "Belirtmek istemiyorum" },
  { value: "belirsiz", label: "Henüz belirlemedim" },
  { value: "25k-alti", label: "Aylık 25.000 ₺'ye kadar" },
  { value: "25k-75k", label: "Aylık 25.000 – 75.000 ₺" },
  { value: "75k-200k", label: "Aylık 75.000 – 200.000 ₺" },
  { value: "200k-ustu", label: "Aylık 200.000 ₺ üzeri" },
];

export type LeadInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  services: string[];
  brief: string;
  budget: string;
  kvkk: boolean;
};

export type LeadField = keyof LeadInput;
export type LeadErrors = Partial<Record<LeadField, string>>;

export const limits = {
  name: 100,
  company: 120,
  email: 254,
  phone: 25,
  website: 200,
  briefMin: 20,
  briefMax: 3000,
};

// Strip control characters (keeps \n and \t in the brief) and trim.
function clean(value: unknown, keepNewlines = false) {
  if (typeof value !== "string") return "";
  const pattern = keepNewlines ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return value.replace(pattern, "").trim();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s.-]+$/;
const DOMAIN = /^(https?:\/\/)?([a-z0-9ğüşöçı-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

type Options = { serviceValues: string[] };

export function parseLead(raw: Record<string, unknown>, { serviceValues }: Options) {
  const services = Array.isArray(raw.services) ? raw.services.map((s) => clean(s)) : [];
  const data: LeadInput = {
    name: clean(raw.name),
    company: clean(raw.company),
    email: clean(raw.email).toLowerCase(),
    phone: clean(raw.phone),
    website: clean(raw.website),
    services: [...new Set(services)],
    brief: clean(raw.brief, true),
    budget: clean(raw.budget),
    kvkk: raw.kvkk === true || raw.kvkk === "on" || raw.kvkk === "true",
  };

  const errors: LeadErrors = {};

  if (data.name.length < 2) errors.name = "Adını ve soyadını yazar mısın?";
  else if (data.name.length > limits.name) errors.name = `En fazla ${limits.name} karakter olabilir.`;

  if (!data.company) errors.company = "Şirketinin ya da markanın adını yaz.";
  else if (data.company.length > limits.company) errors.company = `En fazla ${limits.company} karakter olabilir.`;

  if (!data.email) errors.email = "Sana dönebilmemiz için e-posta adresi gerekli.";
  else if (data.email.length > limits.email || !EMAIL.test(data.email))
    errors.email = "E-posta adresi geçerli görünmüyor. Örnek: ad@marka.com";

  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    if (!PHONE.test(data.phone) || digits.length < 10 || digits.length > 15 || data.phone.length > limits.phone)
      errors.phone = "Telefon numarası geçerli görünmüyor. Örnek: +90 5XX XXX XX XX";
  }

  if (data.website) {
    if (data.website.length > limits.website || !DOMAIN.test(data.website))
      errors.website = "Web sitesi adresi geçerli görünmüyor. Örnek: marka.com";
    else if (!/^https?:\/\//i.test(data.website)) data.website = `https://${data.website}`;
  }

  const allowed = new Set([...serviceValues, UNSURE]);
  if (data.services.length === 0) errors.services = "En az bir seçenek işaretle. Emin değilsen “Henüz emin değilim”i seç.";
  else if (data.services.some((s) => !allowed.has(s))) errors.services = "Geçersiz bir seçenek gönderildi.";

  if (data.brief.length < limits.briefMin)
    errors.brief = `Biraz daha anlat: en az ${limits.briefMin} karakter. Hedefin ne, nerede takılıyorsun?`;
  else if (data.brief.length > limits.briefMax) errors.brief = `En fazla ${limits.briefMax} karakter olabilir.`;

  if (!budgetOptions.some((option) => option.value === data.budget)) errors.budget = "Geçersiz bir seçenek gönderildi.";

  if (!data.kvkk) errors.kvkk = "Devam etmek için aydınlatma metnini okuduğunu onayla.";

  const ok = Object.keys(errors).length === 0;
  return ok ? { ok: true as const, data } : { ok: false as const, errors };
}

/** Field order, used to focus the first invalid field and to order the error summary. */
export const fieldOrder: LeadField[] = [
  "name",
  "company",
  "email",
  "phone",
  "website",
  "services",
  "brief",
  "budget",
  "kvkk",
];

export type LeadResponse =
  | { ok: true }
  | { ok: false; code: "invalid"; errors: LeadErrors }
  | { ok: false; code: "not_configured" | "delivery_failed" | "rate_limited" | "too_fast" | "bad_request" };
