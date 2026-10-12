"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Poster } from "@/content/gallery";
import { posterSize } from "@/content/gallery";
import { Arrow, ArrowLeft } from "../icons";

type Props = { posters: Poster[] };

/**
 * One poster at a time. The headline of each poster is repeated as real text,
 * so nobody has to read type baked into an image. Native scroll-snap does the
 * moving; the buttons and the counter are progressive enhancement.
 */
export function PosterGallery({ posters }: Props) {
  const trackRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("li").forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  function go(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(posters.length - 1, index));
    const slide = track.children[target] as HTMLElement | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <ol
        ref={trackRef}
        tabIndex={0}
        aria-label="Kampanya afişleri, yatay kaydırılabilir"
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(current + 1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(current - 1);
          }
        }}
      >
        {posters.map((poster, index) => (
          <li
            key={poster.slug}
            data-index={index}
            aria-label={`${index + 1} / ${posters.length}`}
            className="grid-12 w-full shrink-0 snap-start items-center gap-y-8"
          >
            <div className="col-span-4 md:col-span-5 md:col-start-1 lg:col-span-4">
              <div className="mx-auto max-w-[26rem] md:max-w-none">
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  width={posterSize.width}
                  height={posterSize.height}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 90vw"
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-auto w-full"
                />
              </div>
            </div>
            <div className="col-span-4 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-6">
              <p className="eyebrow text-cream/70">{poster.tag}</p>
              <h3 className="display t-lg mt-4">{poster.headline}</h3>
              <p className="lead mt-4 font-semibold text-red">{poster.sub}</p>
              <p className="mt-6 max-w-lg text-cream/80">{poster.note}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex items-center justify-between gap-6 border-t border-cream/15 pt-6">
        <p className="display t-sm tabular-nums" aria-live="polite">
          {String(current + 1).padStart(2, "0")}
          <span className="text-cream/50"> / {String(posters.length).padStart(2, "0")}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost-cream size-12 min-h-0 p-0"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            aria-label="Önceki afiş"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            type="button"
            className="btn btn-ghost-cream size-12 min-h-0 p-0"
            onClick={() => go(current + 1)}
            disabled={current === posters.length - 1}
            aria-label="Sonraki afiş"
          >
            <Arrow className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
