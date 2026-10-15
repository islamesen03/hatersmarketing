import Link from "next/link";
import type { Headline as HeadlineType, Picture } from "@/content/types";
import { cn } from "@/lib/cn";
import { Headline } from "./Headline";
import { SceneFigure } from "./motion/SceneFigure";

type Crumb = { name: string; path: string };

type Props = {
  eyebrow: string;
  headline: HeadlineType;
  lead?: React.ReactNode;
  crumbs?: Crumb[];
  image?: Picture;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, headline, lead, crumbs = [], image, children }: Props) {
  return (
    <section aria-labelledby="page-title" className="bg-ink text-cream">
      <div className="shell pt-8 pb-16 md:pt-10 md:pb-24">
        {crumbs.length > 0 && (
          <nav aria-label="Sayfa konumu" className="text-sm text-cream/65">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="hover:text-cream">
                  Ana sayfa
                </Link>
              </li>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={crumb.path} className="flex items-center gap-2">
                    <span aria-hidden="true">/</span>
                    {last ? (
                      <span aria-current="page" className="text-cream">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link href={crumb.path} className="hover:text-cream">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className={cn("grid-12 mt-12 gap-y-12 md:mt-16", image && "items-end")}>
          <div className={cn("col-span-4", image ? "md:col-span-7" : "md:col-span-12")}>
            <p className="eyebrow fade-in text-cream/70" style={{ ["--delay" as string]: "0ms" }}>
              {eyebrow}
            </p>
            <div className="@container mt-5">
              <Headline
                as="h1"
                id="page-title"
                lines={headline}
                reveal
                className={image ? "text-[min(15cqi,8.5rem)]" : "text-[min(13cqi,10.5rem)]"}
              />
            </div>
            {lead && (
              <div className="lead fade-in mt-8 max-w-2xl text-cream/85" style={{ ["--delay" as string]: "380ms" }}>
                {lead}
              </div>
            )}
            {children}
          </div>
          {image && (
            <figure
              className={cn(
                "fade-in col-span-4 md:col-span-5",
                // A scene brings its own field and clipping; a plain photo keeps the tone field.
                !image.scene && "overflow-clip",
                !image.scene && (image.tone === "ink" ? "bg-ink" : image.tone === "red" ? "bg-red" : "bg-cream"),
              )}
              style={{ ["--delay" as string]: "480ms" }}
            >
              <SceneFigure picture={image} sizes="(min-width: 768px) 40vw, 100vw" className="h-auto w-full" eager />
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
