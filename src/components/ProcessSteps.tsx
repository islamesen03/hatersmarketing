import { method } from "@/content/home";

type Props = { tone?: "cream" | "ink" };

export function ProcessSteps({ tone = "cream" }: Props) {
  const muted = tone === "cream" ? "text-ink/75" : "text-cream/75";
  const rule = tone === "cream" ? "bg-ink" : "bg-cream/30";
  // Small red type on cream needs the darker ink (brand red there is large-type only).
  const number = tone === "cream" ? "text-red-ink" : "text-red";
  return (
    <ol className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
      {method.map((step, index) => (
        // The rule is drawn in by a scroll timeline where supported; otherwise it is simply there.
        <li
          key={step.word}
          className="relative border-t-2 border-transparent pt-5"
          data-reveal
          data-step
          style={{ ["--i" as string]: index }}
        >
          <span aria-hidden="true" className={`rule-draw ${rule}`} />
          <p className="eyebrow">
            <span className={number}>{String(index + 1).padStart(2, "0")}</span>
            <span className="sr-only">. adım</span>
          </p>
          <h3 className="display t-md mt-4">{step.word}</h3>
          <p className={`mt-4 ${muted}`}>{step.body}</p>
          <p className="mt-5 text-sm">
            <span className="font-semibold">Çıktı: </span>
            <span className={muted}>{step.output}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
