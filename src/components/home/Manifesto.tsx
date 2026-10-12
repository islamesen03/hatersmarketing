import { manifesto } from "@/content/home";

/**
 * The reversal, as layout: the first line is set against the reading direction
 * (right-aligned) and, where scroll-driven animation is supported, arrives upside
 * down and rights itself as it enters view. Its final state is always readable.
 * The logo is never transformed.
 */
export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="section-y bg-cream text-ink">
      <div className="shell grid-12 gap-y-14">
        <p className="eyebrow col-span-4 md:col-span-12">{manifesto.eyebrow}</p>

        <h2 id="manifesto-title" className="display t-xxl col-span-4 md:col-span-12">
          <span data-upright className="block text-right text-ink/60">
            {manifesto.flipped}
          </span>{" "}
          <span className="block">{manifesto.upright}</span>{" "}
          <span className="block text-red">{manifesto.close}</span>
        </h2>

        <div className="prose-copy lead col-span-4 md:col-span-6 md:col-start-7" data-reveal>
          {manifesto.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <aside
          className="col-span-4 self-start bg-ink p-6 text-cream md:col-span-5 md:col-start-1 md:row-start-3 md:p-8"
          data-reveal
        >
          <p className="eyebrow text-red">Not</p>
          <p className="mt-3 text-lg font-semibold leading-snug">{manifesto.aside}</p>
        </aside>
      </div>
    </section>
  );
}
