import type { Metadata } from "next";
import { MotionBoundary } from "@/components/motion/MotionBoundary";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { posterSize, posters } from "@/content/gallery";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "İşlerimiz ve Konsept Çalışmaları",
  description:
    "Haters Marketing'in kendi kampanya serisinden konsept çalışmaları ve vaka çalışmalarını nasıl yayınladığımız: yalnızca müşteri izniyle, doğrulanabilir sonuçlarla.",
  path: "/islerimiz",
});

const caseStudyOutline = [
  { title: "Başlangıç", body: "Marka nerede duruyordu, neyi denemişti, ne rahatsız ediyordu?" },
  { title: "Soru", body: "Hangi varsayımı sorguladık? Asıl sorun neydi?" },
  { title: "Deneme", body: "Neyi, hangi hipotezle ve hangi ölçütle test ettik?" },
  { title: "Öğrenilen", body: "İşe yarayan ve yaramayan; ikisi de yazılı." },
  { title: "Sonuç", body: "Yalnızca doğrulanabilir rakamlar, müşterinin onayıyla." },
];

export default function WorkPage() {
  return (
    <MotionBoundary>
      <PageHero
        eyebrow="İşlerimiz"
        headline={[{ text: "Gösterişe değil." }, { text: "Etkiye bak.", accent: true }]}
        crumbs={[{ name: "İşlerimiz", path: "/islerimiz" }]}
        lead={
          <p>
            Bir işi ancak müşterimiz izin verdiğinde ve sonucunu doğrulayabildiğimizde paylaşırız. Süslenmiş bir
            vaka çalışması, boş bir rapordan farksızdır.
          </p>
        }
      />

      <section aria-labelledby="cases" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Vaka çalışmaları</p>
            <h2 id="cases" className="display t-lg mt-6" data-enter="left">
              İzinle, kanıtla.
            </h2>
            <p className="mt-6 max-w-md text-ink/80">
              Müşteri vaka çalışmaları, yayın izinleri tamamlandıkça burada yer alacak. Her biri aynı iskeleti
              izleyecek; böylece neyin gerçekten işe yaradığını görebileceksin.
            </p>
          </div>
          <ol className="col-span-4 border-t border-ink md:col-span-6 md:col-start-7">
            {caseStudyOutline.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-ink py-5">
                <span className="eyebrow pt-1 text-red-ink">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-ink/75">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="concepts" className="section-y bg-ink text-cream">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Konsept çalışmaları</p>
            <div className="col-span-4 md:col-span-9">
              <h2 id="concepts" className="display t-xl" data-enter="left">
                Kendi sesimizle.
              </h2>
              <p className="mt-6 max-w-2xl text-cream/80">
                Haters Marketing&apos;in kendi sosyal medya serisinden afişler. Her biri bir pazarlama
                yanılgısını tek bir nesne ve tek bir cümleyle anlatıyor.
              </p>
            </div>
          </div>

          <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
            {posters.map((poster) => (
              <li key={poster.slug} data-reveal>
                <figure>
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    width={posterSize.width}
                    height={posterSize.height}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="h-auto w-full"
                  />
                  <figcaption className="mt-5">
                    <p className="eyebrow text-cream/65">{poster.tag}</p>
                    <h3 className="display t-sm mt-3">{poster.headline}</h3>
                    <p className="mt-2 text-cream/80">{poster.sub}</p>
                    <p className="mt-4 inline-block border border-cream/40 px-2 py-1 text-xs font-semibold">
                      Konsept çalışması — müşteri projesi değildir
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        headline={[{ text: "Sıradaki vaka" }, { text: "senin markan olabilir.", accent: true }]}
        body="Ama önce, gerçekten uyumlu olup olmadığımızı görelim. Markanı ve hedefini anlat."
        track="work-closer"
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "İşlerimiz", path: "/islerimiz" }])} />
    </MotionBoundary>
  );
}
