import Link from "next/link";
import { services } from "@/content/services";
import { Arrow } from "./icons";

type Props = { headingLevel?: "h2" | "h3" };

/**
 * Typographic service rows. The summary is always visible (no hover-only content);
 * hover and keyboard focus invert the row.
 */
export function ServicesList({ headingLevel = "h3" }: Props) {
  const Heading = headingLevel;
  return (
    <ul className="border-t border-ink">
      {services.map((service) => (
        <li key={service.slug} className="border-b border-ink">
          <Link
            href={`/hizmetler/${service.slug}`}
            prefetch={true}
            className="group -mx-[clamp(1rem,4vw,3.5rem)] grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 px-[clamp(1rem,4vw,3.5rem)] py-7 transition-colors duration-200 hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream md:grid-cols-[4rem_minmax(0,1.15fr)_minmax(0,1fr)_auto] md:py-9"
          >
            <span className="eyebrow text-ink/70 transition-colors group-hover:text-red group-focus-visible:text-red">
              {service.number}
            </span>
            <Heading className="display t-md">{service.name}.</Heading>
            <p className="col-span-2 max-w-md text-[0.9875rem] text-ink/75 transition-colors group-hover:text-cream/80 group-focus-visible:text-cream/80 md:col-span-1">
              {service.oneLiner}
            </p>
            <span className="hidden size-12 items-center justify-center border border-current transition-transform duration-200 group-hover:translate-x-1 md:flex">
              <Arrow className="size-5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
