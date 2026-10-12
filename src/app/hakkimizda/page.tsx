import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { Logo } from "@/components/Logo";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hakkımızda: Adımız Ters, İşimiz Net",
  description:
    "Haters Marketing adını Türkçedeki “ters” kelimesinden alır. Markalara duymak istediklerini değil, duymaları gerekenleri söyleyen bir pazarlama ajansının inandıkları.",
  path: "/hakkimizda",
});

// From brand guide p.2 ("The idea").
const logoAnatomy = [
  "“HA” dik durur.",
  "Kırmızı etiket, marka rengini taşır.",
  "“TERS” baş aşağı çevrilmiştir; harfler okuma sırasını korur.",
  "“MARKETING”, logonun tam genişliğine yayılır.",
];

const beliefs = [
  { a: "Beğeni değil,", b: "iş sonucu." },
  { a: "Rapor değil,", b: "karar." },
  { a: "Herkese değil,", b: "doğru kişiye." },
  { a: "Kopya değil,", b: "fark." },
  { a: "Garanti değil,", b: "şeffaflık." },
];

const dislikes = [
  "Boş raporlar",
  "“Algoritma böyle” bahanesi",
  "Herkese benzeyen kreatifler",
  "Ölçülmeyen bütçe",
  "Sadece beğeni sayan hedefler",
  "Uzadıkça uzayan satın alma yolu",
  "Cevapsız kalan mesajlar",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        headline={[{ text: "Adımız ters." }, { text: "İşimiz net.", accent: true }]}
        crumbs={[{ name: "Hakkımızda", path: "/hakkimizda" }]}
        lead={
          <p>
            “Ters”, Türkçede baş aşağı, tersine, aksi demek. Biz de öyle çalışıyoruz: markalara duymak
            istediklerini değil, duymaları gerekenleri söylüyoruz. Kabalık için değil, netlik için.
          </p>
        }
      />

      <section aria-labelledby="logo-idea" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Fikir</p>
            <h2 id="logo-idea" className="display t-lg mt-6">
              Ters dediysek, gerçekten ters.
            </h2>
            <p className="mt-6 max-w-md text-ink/80">
              Logomuz bu fikri kelimesi kelimesine uygular: dört harf, ters yapıştırılmış bir etiket gibi kırmızı
              bir zeminin üzerinde baş aşağı durur.
            </p>
            <ol className="mt-10 space-y-4">
              {logoAnatomy.map((item, index) => (
                <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-ink/20 pt-4">
                  <span className="eyebrow pt-1 text-red-ink">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="col-span-4 grid gap-px bg-ink/15 md:col-span-6 md:col-start-7">
            <figure className="flex min-h-56 items-center justify-center bg-ink p-8">
              <Logo variant="on-dark" width={260} clearSpace />
              <figcaption className="sr-only">Logo, siyah zemin üzerinde</figcaption>
            </figure>
            <div className="grid gap-px sm:grid-cols-2">
              <figure className="flex min-h-48 items-center justify-center bg-cream p-6">
                <Logo variant="on-light" width={180} clearSpace />
                <figcaption className="sr-only">Logo, krem zemin üzerinde</figcaption>
              </figure>
              <figure className="flex min-h-48 items-center justify-center bg-red p-6">
                <Logo variant="on-red" width={180} clearSpace />
                <figcaption className="sr-only">Logo, kırmızı zemin üzerinde</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="beliefs" className="section-y bg-ink text-cream">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">İlkeler</p>
            <h2 id="beliefs" className="display t-xl col-span-4 md:col-span-9">
              Neye inanıyoruz.
            </h2>
          </div>
          <ul className="mt-14 border-t border-cream/25 md:mt-20">
            {beliefs.map((item) => (
              <li key={item.a} className="border-b border-cream/25 py-5 md:py-7" data-reveal>
                <p className="display t-lg">
                  {item.a} <span className="text-red">{item.b}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="dislikes" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Peki “haters” kimden nefret ediyor?</p>
            <h2 id="dislikes" className="display t-lg mt-6">
              Kimseden. Şunlardan hoşlanmıyoruz.
            </h2>
            <p className="mt-6 max-w-md text-ink/80">
              Müşterilerimize, rakiplerimize ya da sektöre karşı bir öfkemiz yok. Tahammülümüzün az olduğu şey,
              işi büyütmeyen alışkanlıklar.
            </p>
          </div>
          <ul className="col-span-4 md:col-span-6 md:col-start-7">
            {dislikes.map((item) => (
              <li
                key={item}
                className="display t-md border-b border-ink/20 py-3 line-through decoration-red decoration-[0.09em]"
              >
                {item}.
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        headline={[{ text: "Herkese hitap" }, { text: "etmiyoruz.", accent: true }]}
        body="Sana ediyorsa, konuşalım. Markanı, hedefini ve takıldığın yeri anlat."
        track="about-closer"
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Hakkımızda", path: "/hakkimizda" }])} />
    </>
  );
}
