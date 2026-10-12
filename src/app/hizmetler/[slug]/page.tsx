import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { TrackView } from "@/components/TrackView";
import { Arrow } from "@/components/icons";
import { getService, services } from "@/content/services";
import { cta, site } from "@/content/site";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

// Every known slug is prerendered in full. Resolving params before rendering lets an
// unknown slug answer with a real 404 status instead of a streamed fallback; links to
// these pages use prefetch={true}, so navigations stay instant in production.
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/hizmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/hizmetler/${service.slug}`,
  });
}

export default async function ServicePage({ params }: PageProps<"/hizmetler/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const path = `/hizmetler/${service.slug}`;
  const others = services.filter((s) => s.slug !== service.slug);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.oneLiner,
    url: absoluteUrl(path),
    provider: { "@id": `${site.url}/#organization` },
    inLanguage: "tr-TR",
  };

  return (
    <>
      <PageHero
        eyebrow={`${service.number} / ${service.name}`}
        headline={service.headline}
        crumbs={[
          { name: "Hizmetler", path: "/hizmetler" },
          { name: service.name, path },
        ]}
        lead={<p>{service.intro}</p>}
        image={service.image}
      />

      <section aria-labelledby="for-whom" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Kimler için?</p>
            <h2 id="for-whom" className="display t-lg mt-6">
              Kendini burada gördüysen.
            </h2>
            <ul className="mt-10 space-y-5">
              {service.forWhom.map((item) => (
                <li key={item} className="flex gap-4 border-t border-ink/20 pt-5 text-lg font-semibold">
                  <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 bg-red" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <p className="eyebrow">Masana ne gelir?</p>
            <h2 className="display t-lg mt-6">Teslim ettiklerimiz.</h2>
            <ol className="mt-10 border-t border-ink">
              {service.deliverables.map((item, index) => (
                <li key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-ink py-5">
                  <span className="eyebrow pt-1 text-red-ink">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-ink/75">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="how" className="section-y bg-ink text-cream">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Süreç</p>
            <h2 id="how" className="display t-xl col-span-4 md:col-span-9">
              Dinle. Sorgula. <span className="text-red">Sonra yap.</span>
            </h2>
          </div>
          <div className="mt-14 md:mt-20">
            <ProcessSteps tone="ink" />
          </div>
        </div>
      </section>

      <section aria-labelledby="notes" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Açık konuşalım</p>
            <h2 id="notes" className="display t-lg mt-6">
              Dürüst notlar.
            </h2>
            <ul className="mt-10 space-y-4">
              {service.honestNotes.map((note) => (
                <li key={note} className="border-l-2 border-ink pl-4 text-ink/85">
                  {note}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <p className="eyebrow">Sık sorulanlar</p>
            <div className="mt-6">
              <FAQAccordion items={service.faqs} />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        headline={[{ text: "Takıldığın yeri" }, { text: "anlat.", accent: true }]}
        body="Kısa bir brif yeterli: markan, hedefin ve şu an seni rahatsız eden şey. Gerisini ilk görüşmede netleştiririz."
        action={{ label: service.cta, href: cta.brief.href }}
        track={`service-${service.slug}`}
      />

      <nav aria-labelledby="other-services" className="bg-ink py-16 text-cream md:py-20">
        <div className="shell">
          <h2 id="other-services" className="eyebrow text-cream/70">
            Diğer hizmetler
          </h2>
          <ul className="mt-8 grid gap-px bg-cream/15 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other) => (
              <li key={other.slug} className="bg-ink">
                <Link
                  href={`/hizmetler/${other.slug}`}
                  prefetch={true}
                  className="group flex h-full min-h-36 flex-col justify-between gap-6 p-6 transition-colors hover:bg-cream hover:text-ink"
                >
                  <span className="eyebrow text-cream/60 group-hover:text-ink/70">{other.number}</span>
                  <span className="flex items-end justify-between gap-4">
                    <span className="display t-sm">{other.name}.</span>
                    <Arrow className="size-5 shrink-0" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <TrackView event="service_view" label={service.slug} />
      <JsonLd data={serviceJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Hizmetler", path: "/hizmetler" },
          { name: service.name, path },
        ])}
      />
    </>
  );
}
