import { closer } from "@/content/home";
import { cta } from "@/content/site";
import type { Headline as HeadlineType } from "@/content/types";
import { Headline } from "./Headline";
import { ButtonLink } from "./ButtonLink";

type Props = {
  headline?: HeadlineType;
  body?: string;
  action?: { label: string; href: string };
  track?: string;
};

/** The red field: oversized cream type, the uncomfortable line in black, one black button. */
export function CTASection({
  headline = closer.headline,
  body = closer.body,
  action = cta.brief,
  track = "closer",
}: Props) {
  return (
    <section aria-labelledby="closer-title" className="on-red section-y bg-red text-ink">
      <div className="shell">
        <Headline id="closer-title" lines={headline} tone="on-red" className="t-xxl max-w-[14ch]" enter="sides" />
        <div className="mt-12 flex flex-col gap-8 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p className="lead max-w-xl font-semibold">{body}</p>
          <ButtonLink href={action.href} variant="ink" track={track} className="self-start md:self-auto">
            {action.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
