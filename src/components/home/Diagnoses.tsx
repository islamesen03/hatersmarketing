import { diagnoses } from "@/content/home";
import { cn } from "@/lib/cn";
import { Headline } from "../Headline";
import { SceneFigure } from "../motion/SceneFigure";

export function Diagnoses() {
  return (
    <section aria-labelledby="diagnoses-title" className="section-y bg-ink text-cream">
      <div className="shell">
        <div className="grid-12 gap-y-6">
          <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Teşhis</p>
          <h2 id="diagnoses-title" className="display t-xl col-span-4 md:col-span-9" data-enter="left">
            Sorun çoğu zaman bütçe değil.
          </h2>
        </div>

        <ol className="mt-16 space-y-24 md:mt-24 md:space-y-32">
          {diagnoses.map((item, index) => {
            const flip = index % 2 === 1;
            const scene = Boolean(item.image.scene);
            return (
              <li key={item.label} className="grid-12 items-center gap-y-8">
                <figure
                  className={cn(
                    "col-span-4 md:col-span-5",
                    flip ? "md:col-start-8 md:row-start-1" : "md:col-start-1",
                    // A plain photograph keeps its field and drift; a scene brings its own layers.
                    !scene && "overflow-clip",
                    !scene && (item.image.tone === "red" ? "bg-red" : "bg-cream"),
                  )}
                >
                  <SceneFigure
                    picture={item.image}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="h-auto w-full scale-[1.12]"
                    plainProps={{ "data-drift": "" }}
                  />
                </figure>

                <div
                  className={cn(
                    "col-span-4 md:col-span-6",
                    flip ? "md:col-start-1 md:row-start-1" : "md:col-start-7",
                  )}
                >
                  <p className="eyebrow text-cream/70" data-reveal>
                    {item.label}
                  </p>
                  <Headline as="h3" lines={item.headline} className="t-lg mt-4" enter="sides" />
                  <div data-reveal>
                    <p className="mt-6 max-w-xl text-cream/80">{item.body}</p>
                    <div className="mt-8 max-w-xl border-l-2 border-red pl-5">
                      <p className="eyebrow text-red">Sonraki adım</p>
                      <p className="mt-2 font-semibold">{item.nextStep}</p>
                    </div>
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
