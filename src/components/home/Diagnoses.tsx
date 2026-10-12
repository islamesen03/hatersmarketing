import Image from "next/image";
import { diagnoses } from "@/content/home";
import { cn } from "@/lib/cn";
import { Headline } from "../Headline";

export function Diagnoses() {
  return (
    <section aria-labelledby="diagnoses-title" className="section-y bg-ink text-cream">
      <div className="shell">
        <div className="grid-12 gap-y-6">
          <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Teşhis</p>
          <h2 id="diagnoses-title" className="display t-xl col-span-4 md:col-span-9">
            Sorun çoğu zaman bütçe değil.
          </h2>
        </div>

        <ol className="mt-16 space-y-24 md:mt-24 md:space-y-32">
          {diagnoses.map((item, index) => {
            const flip = index % 2 === 1;
            return (
              <li key={item.label} className="grid-12 items-center gap-y-8">
                <figure
                  className={cn(
                    "col-span-4 overflow-hidden md:col-span-5",
                    flip ? "md:col-start-8 md:row-start-1" : "md:col-start-1",
                    item.image.tone === "red" ? "bg-red" : "bg-cream",
                  )}
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="h-auto w-full scale-[1.12]"
                    data-drift
                  />
                </figure>

                <div
                  className={cn(
                    "col-span-4 md:col-span-6",
                    flip ? "md:col-start-1 md:row-start-1" : "md:col-start-7",
                  )}
                  data-reveal
                >
                  <p className="eyebrow text-cream/70">{item.label}</p>
                  <Headline as="h3" lines={item.headline} className="t-lg mt-4" />
                  <p className="mt-6 max-w-xl text-cream/80">{item.body}</p>
                  <div className="mt-8 max-w-xl border-l-2 border-red pl-5">
                    <p className="eyebrow text-red">Sonraki adım</p>
                    <p className="mt-2 font-semibold">{item.nextStep}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
