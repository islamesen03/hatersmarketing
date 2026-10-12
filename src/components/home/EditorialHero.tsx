import Image from "next/image";
import Link from "next/link";
import { hero } from "@/content/home";
import { cta } from "@/content/site";
import { Headline } from "../Headline";
import { ButtonLink } from "../ButtonLink";
import { Arrow } from "../icons";

export function EditorialHero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-ink text-cream">
      <div className="shell grid-12 min-h-[calc(100svh-var(--header-h))] content-between gap-y-12 pt-10 pb-10 md:pt-14 lg:pb-14">
        <div className="col-span-4 md:col-span-12">
          <div className="flex items-start justify-between gap-6">
            <p className="eyebrow fade-in text-cream/70" style={{ ["--delay" as string]: "0ms" }}>
              {hero.eyebrow}
            </p>
            <p className="scroll-cue eyebrow hidden text-[0.6875rem] text-cream/60 lg:block" aria-hidden="true">
              Kaydır
            </p>
          </div>
          {/* Container units size the statement to its column, so it never clips. */}
          <div className="@container mt-5 md:mt-8">
            <Headline
              as="h1"
              id="hero-title"
              lines={hero.headline}
              reveal
              className="text-[min(19.2cqi,15rem)]"
            />
          </div>
        </div>

        <div className="fade-in col-span-4 self-end md:col-span-5" style={{ ["--delay" as string]: "420ms" }}>
          <p className="lead font-semibold">{hero.lead}</p>
          <p className="mt-3 max-w-md text-cream/75">{hero.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink href={cta.primary.href} track="hero">
              {cta.primary.label}
            </ButtonLink>
            <Link href={hero.secondary.href} className="link-arrow min-h-11 text-cream">
              {hero.secondary.label} <Arrow className="size-4" />
            </Link>
          </div>
        </div>

        <figure
          className="fade-in col-span-4 self-end md:col-span-7 md:-mr-[clamp(1rem,4vw,3.5rem)]"
          style={{ ["--delay" as string]: "560ms" }}
        >
          <div className="overflow-hidden bg-cream">
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              width={hero.image.width}
              height={hero.image.height}
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm text-cream/70 md:pr-[clamp(1rem,4vw,3.5rem)]">
            <span>{hero.caption}</span>
            <span className="eyebrow text-[0.6875rem] text-cream/60">27 / Tanışalım</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
