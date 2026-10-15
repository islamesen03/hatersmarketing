import type { Metadata } from "next";
import { MotionBoundary } from "@/components/motion/MotionBoundary";
import { PageHero } from "@/components/PageHero";
import { ServicesList } from "@/components/ServicesList";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hizmetler: Strateji, Reklam Kreatifi ve Meta Reklam Yönetimi",
  description:
    "Strateji ve marka konumlandırma, kreatif konsept ve reklam tasarımı, Meta reklam yönetimi, performans analizi ve e-ticaret büyüme danışmanlığı. Hepsi tek bir soruya bağlı: satışa ne kattı?",
  path: "/hizmetler",
});

export default function ServicesPage() {
  return (
    <MotionBoundary>
      <PageHero
        eyebrow="Hizmetler"
        headline={[{ text: "Az iş." }, { text: "Net iş.", accent: true }]}
        crumbs={[{ name: "Hizmetler", path: "/hizmetler" }]}
        lead={
          <p>
            Her şeyi yapan bir ajans değiliz. Strateji, kreatif ve Meta reklam yönetimi etrafında, birbirini
            besleyen beş alanda çalışıyoruz. İhtiyacın bunların dışındaysa, bunu ilk görüşmede açıkça söyleriz.
          </p>
        }
      />

      <section aria-label="Hizmet listesi" className="section-y bg-cream text-ink">
        <div className="shell">
          <ServicesList headingLevel="h2" />
          <div className="grid-12 mt-20 gap-y-8">
            <h2 className="display t-md col-span-4 md:col-span-4">Nasıl seçeceğim?</h2>
            <div className="prose-copy col-span-4 text-ink/80 md:col-span-7 md:col-start-6">
              <p>
                Seçmek zorunda değilsin. Çoğu marka tek bir “hizmet” değil, tek bir sorunla gelir: satış durdu,
                reklam pahalandı, rakip öne geçti. Takıldığın yeri anlat; hangi parçanın gerektiğini birlikte
                belirleyelim.
              </p>
              <p>
                Hizmet bedeli ve reklam bütçesi ayrı planlanır. Kapsam ve çalışma koşulları ilk görüşmeden sonra
                netleşir. Sonuç garantisi vermeyiz; süreci şeffaf yönetiriz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        headline={[{ text: "Hizmet seçme." }, { text: "Sorunu anlat.", accent: true }]}
        body="Hangi hizmetin gerektiğini bilmek senin işin değil. Takıldığın yeri anlat, gerisini birlikte netleştirelim."
        track="services-closer"
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Hizmetler", path: "/hizmetler" }])} />
    </MotionBoundary>
  );
}
