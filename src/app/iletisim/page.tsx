import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { JsonLd } from "@/components/JsonLd";
import { serviceOptions } from "@/content/services";
import { hasDirectContact, site } from "@/content/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "İletişim: Projeni Konuşalım",
  description:
    "Markanı, hedefini ve takıldığın yeri anlat. Kısa bir brif gönder; ilk görüşmede ya net bir sonraki adım ya da dürüst bir “uygun değiliz” duyarsın.",
  path: "/iletisim",
});

const nextSteps = [
  { title: "Brifini okuruz.", body: "Markanı, hedefini ve takıldığın yeri anlamaya çalışırız." },
  { title: "Uygunsa görüşme öneririz.", body: "Kısa bir tanışma görüşmesinde sorularımızı sorarız." },
  { title: "Değilsek söyleriz.", body: "Uyumlu olmadığımızı düşünürsek bunu açıkça yazarız." },
];

export default function ContactPage() {
  const { email, phone, whatsapp, calendarUrl } = site.contact;

  return (
    <>
      <PageHero
        eyebrow="İletişim"
        headline={[{ text: "Biraz" }, { text: "rahatsız", accent: true }, { text: "olalım." }]}
        crumbs={[{ name: "İletişim", path: "/iletisim" }]}
        lead={<p>Markanın duyması gerekenleri konuşalım. Kısa bir brif yeter; gerisini birlikte netleştiririz.</p>}
      />

      <section id="brif" aria-labelledby="brief-title" className="section-y scroll-mt-24 bg-cream text-ink">
        <div className="shell grid-12 gap-y-14">
          <aside className="col-span-4 md:col-span-4">
            <p className="eyebrow">Sonra ne olur?</p>
            <ol className="mt-6 space-y-6">
              {nextSteps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-ink pt-4">
                  <span className="display t-sm text-red">{index + 1}</span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-ink/75">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 border-t border-ink pt-6">
              <p className="eyebrow">Doğrudan iletişim</p>
              {hasDirectContact() ? (
                <ul className="mt-4 space-y-2 font-semibold">
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} className="underline underline-offset-4" data-track="contact_click" data-track-label="email">
                        {email}
                      </a>
                    </li>
                  )}
                  {phone && (
                    <li>
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline underline-offset-4" data-track="contact_click" data-track-label="phone">
                        {phone}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li>
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                        data-track="contact_click"
                        data-track-label="whatsapp"
                      >
                        WhatsApp<span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </li>
                  )}
                  {calendarUrl && (
                    <li>
                      <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                        data-track="contact_click"
                        data-track-label="calendar"
                      >
                        Görüşme zamanı seç<span className="sr-only"> (yeni sekmede açılır)</span>
                      </a>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-4 text-ink/80">Şimdilik bize ulaşmanın en hızlı yolu bu form.</p>
              )}
            </div>
          </aside>

          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <h2 id="brief-title" className="display t-lg">
              Markanı anlat.
            </h2>
            <div className="mt-10">
              <LeadForm serviceOptions={serviceOptions} />
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "İletişim", path: "/iletisim" }])} />
    </>
  );
}
