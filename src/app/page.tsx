import type { Metadata } from "next";
import { MotionBoundary } from "@/components/motion/MotionBoundary";
import { EditorialHero } from "@/components/home/EditorialHero";
import { Manifesto } from "@/components/home/Manifesto";
import { Diagnoses } from "@/components/home/Diagnoses";
import { ProcessDemo } from "@/components/home/ProcessDemo";
import { ServicesList } from "@/components/ServicesList";
import { ProcessSteps } from "@/components/ProcessSteps";
import { FAQAccordion } from "@/components/FAQAccordion";
import { CTASection } from "@/components/CTASection";
import { ButtonLink } from "@/components/ButtonLink";
import { JsonLd } from "@/components/JsonLd";
import { homeFaqs } from "@/content/home";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Haters Marketing | Meta Reklam Yönetimi, Kreatif ve Strateji Ajansı",
  absoluteTitle: true,
  description:
    "Beğeni değil, iş sonucu. Strateji, reklam kreatifi ve Meta reklam yönetimini ölçülebilir iş hedeflerine bağlayan reklam ajansı. Duymak istediğini değil, duyman gerekeni konuşuruz.",
  path: "/",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HomePage() {
  return (
    <MotionBoundary>
      <EditorialHero />
      <Manifesto />
      <Diagnoses />

      <section aria-labelledby="services-title" className="section-y bg-cream text-ink">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 md:col-span-3">Hizmetler</p>
            <div className="col-span-4 md:col-span-9">
              <h2 id="services-title" className="display t-xl" data-enter="left">
                Beş iş. <span className="text-red">Tek soru.</span>
              </h2>
              <p className="lead mt-6 max-w-2xl text-ink/80">
                Hepsi aynı soruya bağlanır: bu iş satışa ne kattı? Cevabı yoksa, yapmayız.
              </p>
            </div>
          </div>
          <div className="mt-14 md:mt-20">
            <ServicesList />
          </div>
        </div>
      </section>

      <section aria-labelledby="method-title" className="section-y bg-cream text-ink">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 md:col-span-3">Yöntem</p>
            <div className="col-span-4 md:col-span-9">
              <h2 id="method-title" className="display t-xl" data-enter="left">
                Önce soru. <span className="text-red">Sonra reklam.</span>
              </h2>
              <p className="lead mt-6 max-w-2xl text-ink/80">
                Beş adım, her birinin sonunda elinde somut bir belge. Döngü ölçümle kapanır, sonra yeniden başlar.
              </p>
            </div>
          </div>
          <div className="mt-14 md:mt-20">
            <ProcessSteps />
          </div>
          <div className="mt-14">
            <ButtonLink href="/yaklasimimiz" variant="ghost-ink" track="method">
              Yaklaşımımızı oku
            </ButtonLink>
          </div>
        </div>
      </section>

      <ProcessDemo />

      <section aria-labelledby="faq-title" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-4">
            <p className="eyebrow">Sık sorulanlar</p>
            <h2 id="faq-title" className="display t-lg mt-6" data-enter="left">
              Sormadan önce.
            </h2>
            <p className="mt-6 max-w-sm text-ink/80">
              Cevabını burada bulamadığın soruyu doğrudan sor. Bilmediğimiz şeyi biliyormuş gibi yapmayız.
            </p>
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <FAQAccordion items={homeFaqs} />
          </div>
        </div>
      </section>

      <CTASection />
      <JsonLd data={faqJsonLd} />
    </MotionBoundary>
  );
}
