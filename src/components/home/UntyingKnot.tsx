import Image from "next/image";
import type { Picture } from "@/content/types";

type Props = { image: Picture; sizes: string };

/**
 * The hero lace "lets go" as the page scrolls: the same cut-out photo is layered
 * three times (left end, knot, right end). Soft masks overlap only where the knot
 * layer is opaque, so the first frame is identical to the photo; as it scrolls,
 * the ends slide apart and fade into the dark while the knot turns and shrinks.
 * Pure CSS (scroll-driven animation); static under reduced motion or without support.
 */
export function UntyingKnot({ image, sizes }: Props) {
  const layer = (className: string) => (
    <Image
      src={image.src}
      alt=""
      aria-hidden="true"
      fill
      priority
      sizes={sizes}
      className={`knot__layer ${className}`}
    />
  );

  return (
    <div
      role="img"
      aria-label={image.alt}
      className="knot relative w-full"
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      {layer("knot__left")}
      {layer("knot__right")}
      {layer("knot__core")}
    </div>
  );
}
