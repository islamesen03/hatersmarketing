import Link from "next/link";
import { cn } from "@/lib/cn";
import { Arrow } from "./icons";

type Variant = "red" | "ink" | "ghost-cream" | "ghost-ink";

const variants: Record<Variant, string> = {
  red: "btn-red",
  ink: "btn-ink",
  "ghost-cream": "btn-ghost-cream",
  "ghost-ink": "btn-ghost-ink",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Where the CTA sits; sent as an analytics event only after consent. */
  track?: string;
  arrow?: boolean;
};

export function ButtonLink({ href, children, variant = "red", className, track, arrow = true }: Props) {
  return (
    <Link
      href={href}
      className={cn("btn", variants[variant], className)}
      data-track={track ? "cta_click" : undefined}
      data-track-label={track}
    >
      <span>{children}</span>
      {arrow && <Arrow className="size-5 shrink-0" />}
    </Link>
  );
}
