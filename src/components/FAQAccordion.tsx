import type { Faq } from "@/content/types";
import { Plus } from "./icons";

type Props = { items: Faq[]; tone?: "cream" | "ink" };

/** Native <details>: works without JavaScript, keyboard and screen-reader friendly. */
export function FAQAccordion({ items, tone = "cream" }: Props) {
  const rule = tone === "cream" ? "border-ink" : "border-cream/25";
  const muted = tone === "cream" ? "text-ink/80" : "text-cream/80";
  return (
    <div className={`border-t ${rule}`}>
      {items.map((item) => (
        <details key={item.q} className={`group border-b ${rule}`}>
          <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-5 text-lg font-semibold md:text-xl">
            <span>{item.q}</span>
            <span className="flex size-10 shrink-0 items-center justify-center border border-current">
              <Plus className="faq-icon size-4 transition-transform duration-200" />
            </span>
          </summary>
          <p className={`max-w-2xl pb-7 ${muted}`}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
