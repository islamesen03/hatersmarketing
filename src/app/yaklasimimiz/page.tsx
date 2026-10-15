import type { Metadata } from "next";
import { MotionBoundary } from "@/components/motion/MotionBoundary";
import { PageHero } from "@/components/PageHero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CTASection } from "@/components/CTASection";
import { JsonLd } from "@/components/JsonLd";
import { auditChecklist, threeQuestions, wontDo } from "@/content/approach";
import { objects } from "@/content/images";
import { cta } from "@/content/site";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Yaklaşımımız: Önce Soru, Sonra Reklam",
  description:
    "Dinle, sorgula, kurgula, yayına al, ölç. Haters Marketing'in çalışma yöntemi, ön inceleme süreci ve yapmadığı şeyler: sonuç garantisi yok, süslenmiş rapor yok.",
  path: "/yaklasimimiz",
});

export default function ApproachPage() {
  return (
    <MotionBoundary>
      <PageHero
        eyebrow="Yaklaşımımız"
        headline={[{ text: "Önce soru." }, { text: "Sonra reklam.", accent: true }]}
        crumbs={[{ name: "Yaklaşımımız", path: "/yaklasimimiz" }]}
        lead={
          <p>
            Her işe üç soruyla başlarız. Cevaplar netleşmeden tek bir reklam yayına girmez. Yavaş gibi görünür;
            aslında en pahalı hatayı, yanlış şeyi hızla büyütmeyi önler.
          </p>
        }
        image={objects.notebookPencil}
      />

      <section aria-labelledby="questions" className="section-y bg-cream text-ink">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 md:col-span-3">Başlangıç</p>
            <h2 id="questions" className="display t-xl col-span-4 md:col-span-9" data-enter="left">
              Üç soru.
            </h2>
          </div>
          <ol className="mt-14 border-t border-ink md:mt-20">
            {threeQuestions.map((item, index) => (
              <li key={item.q} className="grid-12 gap-y-3 border-b border-ink py-8 md:py-10" data-reveal>
                <span className="display t-md col-span-4 text-red md:col-span-2">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display t-lg col-span-4 md:col-span-6">{item.q}</h3>
                <p className="col-span-4 self-end text-ink/80 md:col-span-4">{item.a}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="method" className="section-y bg-ink text-cream">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Yöntem</p>
            <div className="col-span-4 md:col-span-9">
              <h2 id="method" className="display t-xl" data-enter="left">
                Beş adım. <span className="text-red">Beş belge.</span>
              </h2>
              <p className="lead mt-6 max-w-2xl text-cream/80">
                Her adımın sonunda elinde okuyabileceğin, itiraz edebileceğin bir çıktı olur. Kararlar toplantıda
                kaybolmaz, yazıya geçer.
              </p>
            </div>
          </div>
          <div className="mt-14 md:mt-20">
            <ProcessSteps tone="ink" />
          </div>
        </div>
      </section>

      <section aria-labelledby="audit" className="section-y bg-cream text-ink">
        <div className="shell grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <p className="eyebrow">Ön inceleme</p>
            <h2 id="audit" className="display t-lg mt-6" data-enter="left">
              İlk önce neye bakarız?
            </h2>
            <p className="mt-6 max-w-md text-ink/80">
              Yeni bir kampanya kurmadan önce mevcut durumu okuruz. Bu bölüm biraz rahatsız edici olabilir; doğru
              soruların çoğu burada sorulur. Sonunda kaçakların ve önceliklerin yazılı olduğu kısa bir not çıkar.
            </p>
          </div>
          <ol className="col-span-4 border-t border-ink md:col-span-6 md:col-start-7">
            {auditChecklist.map((item, index) => (
              <li key={item.area} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-ink py-5">
                <span className="eyebrow pt-1 text-red-ink">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold">{item.area}</h3>
                  <p className="mt-1 text-ink/75">{item.question}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="wont" className="section-y bg-ink text-cream">
        <div className="shell">
          <div className="grid-12 gap-y-6">
            <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Sınırlarımız</p>
            <h2 id="wont" className="display t-xl col-span-4 md:col-span-9" data-enter="left">
              Yapmadıklarımız.
            </h2>
          </div>
          <ul className="mt-14 grid gap-px bg-cream/15 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {wontDo.map((item) => (
              <li key={item.title} className="bg-ink p-6 md:p-8" data-reveal>
                <h3 className="display t-sm">{item.title}</h3>
                <p className="mt-4 text-cream/75">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTASection
        headline={[{ text: "Bu kez" }, { text: "baştan konuşalım.", accent: true }]}
        body="Ne yapacağız? Ne yapmayacağız? Neyi ölçeceğiz? Kapsamı ve beklentileri birlikte netleştirelim."
        action={cta.sendBrief}
        track="approach-closer"
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Yaklaşımımız", path: "/yaklasimimiz" }])} />
    </MotionBoundary>
  );
}
