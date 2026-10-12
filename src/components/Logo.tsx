import Image from "next/image";

/**
 * Official brand-kit SVGs only. Never recolour, flip, rotate, stretch or add effects
 * (brand guide p.8). Pick the variant by background (p.4):
 *   on-dark  → black / dark backgrounds
 *   on-light → cream / light backgrounds
 *   on-red   → the brand red only
 */
type Variant = "on-dark" | "on-light" | "on-red";
type Kind = "logo" | "wordmark";

const spec = {
  logo: { dir: "01-logo", file: "logo", ratio: 1268.44 / 2926.41, min: 120 },
  wordmark: { dir: "02-wordmark", file: "wordmark", ratio: 979.38 / 2926.41, min: 72 },
} as const;

/** Clear space = width of the letter H (422.85 of 2926.41 units). */
export const H_RATIO = 422.85 / 2926.41;

type Props = {
  kind?: Kind;
  variant: Variant;
  width: number;
  /** Adds the H-width exclusion zone as padding around the mark. */
  clearSpace?: boolean;
  priority?: boolean;
  className?: string;
};

export function Logo({ kind = "logo", variant, width, clearSpace, priority, className }: Props) {
  const s = spec[kind];
  const w = Math.max(width, s.min);
  const h = Math.round(w * s.ratio);

  return (
    <span
      className={className}
      style={{ display: "inline-block", lineHeight: 0, padding: clearSpace ? Math.round(w * H_RATIO) : 0 }}
    >
      <Image
        src={`/brand/${s.dir}/svg/haters-marketing_${s.file}_${variant}.svg`}
        alt="Haters Marketing"
        width={w}
        height={h}
        priority={priority}
        unoptimized
        style={{ width: w, height: h }}
      />
    </span>
  );
}
