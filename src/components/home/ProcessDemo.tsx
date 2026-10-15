import { sampleDocs } from "@/content/home";
import { cn } from "@/lib/cn";

const tilt = ["md:-rotate-[1.4deg]", "md:rotate-[0.8deg] md:translate-y-8", "md:-rotate-[0.6deg]"];

/**
 * "Proof" without invented proof: illustrative deliverable templates,
 * labelled as such, instead of fabricated metrics or testimonials.
 */
export function ProcessDemo() {
  return (
    <section aria-labelledby="demo-title" className="section-y bg-ink text-cream">
      <div className="shell">
        <div className="grid-12 gap-y-6">
          <p className="eyebrow col-span-4 text-cream/70 md:col-span-3">Nasıl çalışırız</p>
          <div className="col-span-4 md:col-span-9">
            <h2 id="demo-title" className="display t-xl" data-enter="left">
              Söz değil. <span className="text-red">Süreç.</span>
            </h2>
            <p className="lead mt-6 max-w-2xl text-cream/85">
              Rakam uydurmuyoruz, referans süslemiyoruz. Bunun yerine, birlikte çalıştığımızda masana ne
              geleceğini gösterelim.
            </p>
          </div>
        </div>

        <ul className="mt-16 grid gap-8 md:mt-20 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {sampleDocs.map((doc, index) => (
            <li
              key={doc.kind}
              className={cn(
                "bg-cream p-6 text-ink transition-transform duration-300 hover:rotate-0 md:p-7",
                tilt[index],
                index === 2 && "md:col-span-2 lg:col-span-1",
              )}
              data-reveal
            >
              <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
                <p className="eyebrow">{doc.kind}</p>
                <p className="text-xs font-semibold whitespace-nowrap text-red-ink">Örnek şablon</p>
              </div>
              <h3 className="display t-sm mt-5">{doc.title}.</h3>
              <dl className="mt-4 divide-y divide-ink/15 text-[0.9375rem]">
                {doc.rows.map(([term, detail, priority]) => (
                  <div key={term} className="py-3">
                    <dt className="flex items-baseline justify-between gap-3 text-sm font-semibold">
                      {term}
                      {priority && (
                        <span className="border border-ink px-1.5 text-[0.6875rem] tracking-wide uppercase">
                          Öncelik: {priority}
                        </span>
                      )}
                    </dt>
                    <dd className="mt-1 text-ink/80">{detail}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-16 text-sm text-cream/70 md:mt-24">
          Örnek şablonlardır; gerçek müşteri verisi içermez. Doğrulanmış vaka çalışmaları, müşteri izniyle
          yayımlanacak.
        </p>
      </div>
    </section>
  );
}
