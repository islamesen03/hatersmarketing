"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  budgetOptions,
  fieldOrder,
  parseLead,
  UNSURE,
  type LeadErrors,
  type LeadField,
  type LeadResponse,
} from "@/lib/lead";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { Arrow } from "./icons";

type Option = { value: string; label: string };
type Status = "idle" | "submitting" | "success" | "failed";

const failureCopy: Record<string, string> = {
  not_configured:
    "Form henüz bir e-posta ya da CRM hesabına bağlanmadığı için mesajın gönderilmedi. Lütfen daha sonra yeniden dene.",
  delivery_failed: "Mesajın şu an iletilemedi; bizim tarafımızda bir sorun var. Birkaç dakika sonra yeniden dene.",
  rate_limited: "Kısa sürede çok fazla deneme yapıldı. Biraz bekleyip yeniden dene.",
  too_fast: "Form çok hızlı gönderildi. Bilgilerini kontrol edip yeniden gönder.",
  bad_request: "İstek işlenemedi. Sayfayı yenileyip yeniden dene.",
  network: "Bağlantı kurulamadı. İnternet bağlantını kontrol edip yeniden dene.",
};

const labels: Record<LeadField, string> = {
  name: "Ad soyad",
  company: "Şirket / marka adı",
  email: "E-posta",
  phone: "Telefon",
  website: "Web sitesi",
  services: "Hizmet ilgisi",
  brief: "Proje hedefi / kısa brif",
  budget: "Bütçe aralığı",
  kvkk: "Aydınlatma metni onayı",
};

const input =
  "mt-2 block w-full border-2 border-ink bg-cream px-4 py-3 text-base text-ink placeholder:text-ink/45 focus-visible:outline-offset-2 aria-invalid:border-red-ink";

export function LeadForm({ serviceOptions }: { serviceOptions: Option[] }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<LeadErrors>({});
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const id = (field: string) => `${uid}-${field}`;
  const errorId = (field: LeadField) => `${uid}-${field}-error`;
  const describedBy = (field: LeadField, hint?: boolean) =>
    [hint ? `${id(field)}-hint` : null, errors[field] ? errorId(field) : null].filter(Boolean).join(" ") ||
    undefined;

  function collect(form: HTMLFormElement) {
    const fd = new FormData(form);
    return {
      name: fd.get("name"),
      company: fd.get("company"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      website: fd.get("website"),
      services: fd.getAll("services"),
      brief: fd.get("brief"),
      budget: fd.get("budget"),
      kvkk: fd.get("kvkk") === "on",
      hm_extra: fd.get("hm_extra"),
      startedAt: startedAt.current,
    };
  }

  function showErrors(next: LeadErrors) {
    setErrors(next);
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setFailure(null);

    const payload = collect(event.currentTarget);
    const check = parseLead(payload, { serviceValues: serviceOptions.map((o) => o.value) });
    if (!check.ok) {
      showErrors(check.errors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({ ok: false, code: "bad_request" }))) as LeadResponse;

      if (result.ok) {
        setStatus("success");
        track("lead_submit_success", { services: check.data.services.join(",") });
        return;
      }
      setStatus("failed");
      track("lead_submit_error", { code: result.code });
      if (result.code === "invalid") {
        showErrors(result.errors);
      } else {
        setFailure(failureCopy[result.code] ?? failureCopy.bad_request);
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
    } catch {
      setStatus("failed");
      setFailure(failureCopy.network);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (status === "success") {
    return (
      <div className="border-2 border-ink bg-cream p-8 md:p-10" role="status">
        <p className="eyebrow text-red-ink">Gönderildi</p>
        <h2 ref={successRef} tabIndex={-1} className="display t-lg mt-4 outline-none">
          Brifin bize ulaştı.
        </h2>
        <p className="mt-5 max-w-lg text-ink/80">
          Okuyup sana e-posta ile dönüş yapacağız. Uygun değilsek bunu da açıkça söyleyeceğiz. Bu arada
          yaklaşımımıza göz atmak istersen:
        </p>
        <Link href="/yaklasimimiz" className="link-arrow mt-6 min-h-11 text-ink">
          Nasıl çalışıyoruz <Arrow className="size-4" />
        </Link>
      </div>
    );
  }

  const errorList = fieldOrder.filter((field) => errors[field]);
  const submitting = status === "submitting";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby={`${uid}-required`} className="space-y-7">
      <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="assertive">
        {errorList.length > 0 && (
          <div className="border-2 border-red-ink p-5">
            <p className="font-semibold">Formda düzeltilmesi gereken {errorList.length} alan var:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {errorList.map((field) => (
                <li key={field}>
                  <a
                    href={`#${field === "services" ? id("services-0") : id(field)}`}
                    className="underline underline-offset-4"
                  >
                    {labels[field]}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {failure && (
          <div className="border-2 border-red-ink p-5">
            <p className="font-semibold">Mesajın gönderilmedi.</p>
            <p className="mt-2">{failure}</p>
          </div>
        )}
      </div>

      <p id={`${uid}-required`} className="text-sm text-ink/75">
        <span aria-hidden="true">*</span> ile işaretli alanlar zorunlu.
      </p>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Ad soyad" required error={errors.name} errorId={errorId("name")}>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={describedBy("name")}
            className={input}
          />
        </Field>
        <Field label="Şirket / marka adı" required error={errors.company} errorId={errorId("company")}>
          <input
            id={id("company")}
            name="company"
            autoComplete="organization"
            required
            maxLength={120}
            aria-invalid={Boolean(errors.company) || undefined}
            aria-describedby={describedBy("company")}
            className={input}
          />
        </Field>
        <Field label="E-posta" required error={errors.email} errorId={errorId("email")}>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={describedBy("email")}
            className={input}
          />
        </Field>
        <Field
          label="Telefon"
          optional
          hint="Yalnızca bu talep hakkında sana ulaşmak için kullanılır."
          hintId={`${id("phone")}-hint`}
          error={errors.phone}
          errorId={errorId("phone")}
        >
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={25}
            aria-invalid={Boolean(errors.phone) || undefined}
            aria-describedby={describedBy("phone", true)}
            className={input}
          />
        </Field>
      </div>

      <Field label="Web sitesi" optional error={errors.website} errorId={errorId("website")}>
        <input
          id={id("website")}
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="marka.com"
          maxLength={200}
          aria-invalid={Boolean(errors.website) || undefined}
          aria-describedby={describedBy("website")}
          className={input}
        />
      </Field>

      <fieldset aria-describedby={errors.services ? errorId("services") : undefined}>
        <legend className="font-semibold">
          Hangi konuda destek arıyorsun? <span aria-hidden="true">*</span>
          <span className="block text-sm font-normal text-ink/70">Birden fazla seçebilirsin.</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[...serviceOptions, { value: UNSURE, label: "Henüz emin değilim" }].map((option, index) => (
            <label
              key={option.value}
              className="flex min-h-12 cursor-pointer items-start gap-3 border border-ink/30 px-4 py-3 has-checked:border-ink has-checked:bg-ink has-checked:text-cream"
            >
              <input
                id={id(`services-${index}`)}
                type="checkbox"
                name="services"
                value={option.value}
                className="mt-1 size-4 shrink-0 accent-red"
                aria-invalid={Boolean(errors.services) || undefined}
              />
              <span className="text-[0.9375rem] leading-snug">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.services && <ErrorText id={errorId("services")}>{errors.services}</ErrorText>}
      </fieldset>

      <Field
        label="Proje hedefi / kısa brif"
        required
        hint="Markan ne satıyor, hedefin ne, şu an nerede takılıyorsun? Birkaç cümle yeter."
        hintId={`${id("brief")}-hint`}
        error={errors.brief}
        errorId={errorId("brief")}
      >
        <textarea
          id={id("brief")}
          name="brief"
          rows={6}
          required
          maxLength={3000}
          aria-invalid={Boolean(errors.brief) || undefined}
          aria-describedby={describedBy("brief", true)}
          className={cn(input, "resize-y")}
        />
      </Field>

      <Field label="Yaklaşık aylık reklam bütçesi" optional error={errors.budget} errorId={errorId("budget")}>
        <select
          id={id("budget")}
          name="budget"
          defaultValue=""
          aria-invalid={Boolean(errors.budget) || undefined}
          aria-describedby={describedBy("budget")}
          className={cn(input, "appearance-auto")}
        >
          {budgetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("hm_extra")}>Bu alanı boş bırakın</label>
        <input id={id("hm_extra")} name="hm_extra" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id={id("kvkk")}
            type="checkbox"
            name="kvkk"
            required
            className="mt-1 size-5 shrink-0 accent-red"
            aria-invalid={Boolean(errors.kvkk) || undefined}
            aria-describedby={errors.kvkk ? errorId("kvkk") : undefined}
          />
          <span className="text-[0.9375rem]">
            <Link
              href="/kvkk-aydinlatma-metni"
              target="_blank"
              rel="noopener"
              className="font-semibold underline underline-offset-4"
            >
              KVKK Aydınlatma Metni
              <span className="sr-only"> (yeni sekmede açılır)</span>
            </Link>
            &apos;ni okudum. Bilgilerimin bu talebe yanıt verilmesi amacıyla işleneceğini anlıyorum.{" "}
            <span aria-hidden="true">*</span>
          </span>
        </label>
        {errors.kvkk && <ErrorText id={errorId("kvkk")}>{errors.kvkk}</ErrorText>}
      </div>

      <button type="submit" className="btn btn-ink w-full sm:w-auto" disabled={submitting} aria-disabled={submitting}>
        {submitting ? "Gönderiliyor…" : "Brif gönder"}
        {!submitting && <Arrow className="size-5" />}
      </button>
      <noscript>
        <p className="text-sm">Formu göndermek için tarayıcında JavaScript&apos;in açık olması gerekiyor.</p>
      </noscript>
    </form>
  );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-sm font-semibold text-red-ink">
      {children}
    </p>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  hintId?: string;
  error?: string;
  errorId: string;
  children: React.ReactElement<{ id: string }>;
};

function Field({ label, required, optional, hint, hintId, error, errorId, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={children.props.id} className="font-semibold">
        {label}
        {required && <span aria-hidden="true"> *</span>}
        {optional && <span className="font-normal text-ink/70"> (opsiyonel)</span>}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-ink/70">
          {hint}
        </p>
      )}
      {children}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}
