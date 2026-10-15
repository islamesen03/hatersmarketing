import type { SceneId } from "@/content/types";

/**
 * The single source of truth for each scene's scroll choreography. Keyframe offsets are
 * scene progress `p` (0..1, see progress.ts). Transforms are expressed in percentages of
 * the layer's own box, so the same keyframes work at every rendered size; rotation
 * origins come from the manifest's `pivot`.
 *
 * Both drivers consume these frames unchanged: natively through a ViewTimeline, or by
 * scrubbing a paused Web Animation with `currentTime = p * 1000`.
 */
export type LayerKeyframes = Record<string, Keyframe[]>;
export type ChoreographyOptions = { compact: boolean };

export const EASE_EDITORIAL = "cubic-bezier(0.2, 0.7, 0, 1)";
const EASE_SOFT = "cubic-bezier(0.45, 0.05, 0.55, 0.95)";

const t = (x: number, y: number) => `translate3d(${x.toFixed(3)}%, ${y.toFixed(3)}%, 0)`;

function heartBox({ compact }: ChoreographyOptions): LayerKeyframes {
  // Travel in % of the balloon layer's own height (443 artboard px). Desktop: 340 px, i.e.
  // the heart starts mostly below the near rim; mobile: 275 px.
  const drop = compact ? 62 : 76.75;
  const sway = compact ? 1.2 : 2.2;
  const rot = (deg: number) => `rotate(${deg.toFixed(2)}deg)`;
  return {
    balloon: [
      { offset: 0, transform: `${t(0, drop)} ${rot(0)}` },
      { offset: 0.12, transform: `${t(0, drop)} ${rot(0)}`, easing: EASE_EDITORIAL },
      { offset: 0.55, transform: `${t(0, drop * 0.18)} ${rot(-0.55 * sway)}`, easing: EASE_SOFT },
      { offset: 0.66, transform: `${t(0, drop * 0.05)} ${rot(sway)}`, easing: EASE_SOFT },
      { offset: 0.78, transform: `${t(0, 0)} ${rot(-0.7 * sway)}`, easing: EASE_SOFT },
      { offset: 0.9, transform: `${t(0, 0)} ${rot(0.3 * sway)}`, easing: "ease-out" },
      { offset: 1, transform: `${t(0, 0)} ${rot(0)}` },
    ],
  };
}

function cards({ compact }: ChoreographyOptions): LayerKeyframes {
  // Red card: tucked towards the stack along its own long axis (0.947, 0.321), then dealt
  // out to the photographed position. Percentages are of the red-card layer (538x341).
  const tx = compact ? 10.6 : 15.1;
  const ty = compact ? 5.7 : 8.1;
  const rot = compact ? -3.5 : -5;
  return {
    "red-card": [
      { offset: 0, transform: `${t(tx, ty)} rotate(${rot}deg)` },
      { offset: 0.2, transform: `${t(tx, ty)} rotate(${rot}deg)`, easing: EASE_EDITORIAL },
      { offset: 0.65, transform: `${t(0, 0)} rotate(0deg)` },
      { offset: 1, transform: `${t(0, 0)} rotate(0deg)` },
    ],
    "top-card": [
      { offset: 0, transform: "none" },
      { offset: 0.65, transform: "none", easing: EASE_EDITORIAL },
      { offset: 0.85, transform: `${t(-0.9, -1.1)} rotate(-1.2deg)` },
      { offset: 1, transform: `${t(-0.9, -1.1)} rotate(-1.2deg)` },
    ],
  };
}

function pawns({ compact }: ChoreographyOptions): LayerKeyframes {
  const frames: LayerKeyframes = {};
  const dx = compact ? -1.5 : -2.5;
  const dy = compact ? 3 : 4.5;
  for (let i = 0; i < 5; i += 1) {
    const start = i * 0.03;
    const end = 0.1 + i * 0.03;
    frames[`pawn-${i + 1}`] = [
      { offset: 0, transform: t(dx, dy) },
      { offset: start, transform: t(dx, dy), easing: EASE_EDITORIAL },
      { offset: end, transform: t(0, 0) },
      { offset: 1, transform: t(0, 0) },
    ];
  }
  // The red pawn: aligns with the row, then steps forward (up) a little and grows ≤ 1.035.
  const lift = compact ? -4.4 : -6;
  const scale = compact ? 1.02 : 1.035;
  frames["pawn-red"] = [
    { offset: 0, transform: `${t(0, dy)} scale(1)` },
    { offset: 0.25, transform: `${t(0, 0)} scale(1)`, easing: EASE_EDITORIAL },
    { offset: 0.65, transform: `${t(-1, lift)} scale(${scale})` },
    { offset: 1, transform: `${t(-1, lift)} scale(${scale})` },
  ];
  return frames;
}

function owl({ compact }: ChoreographyOptions): LayerKeyframes {
  // The portrait rises into place by ~14 px (its lower edge stays below the stage edge).
  return {
    owl: [
      { offset: 0, transform: t(0, compact ? 1.1 : 1.6), easing: EASE_EDITORIAL },
      { offset: 0.7, transform: t(0, 0) },
      { offset: 1, transform: t(0, 0) },
    ],
  };
}

export function choreography(id: SceneId, options: ChoreographyOptions): LayerKeyframes {
  switch (id) {
    case "heart-box":
      return heartBox(options);
    case "cards":
      return cards(options);
    case "pawns":
      return pawns(options);
    case "owl":
      return owl(options);
  }
}

/** Eyelid close/open cycle: close 110 ms, hold 40 ms, open 165 ms. */
export const WINK_DURATION_MS = 315;
export const WINK_KEYFRAMES: Keyframe[] = [
  { clipPath: "inset(0 0 100% 0)", easing: "cubic-bezier(0.5, 0, 0.85, 0.6)" },
  { clipPath: "inset(0 0 0% 0)", offset: 0.35 },
  { clipPath: "inset(0 0 0% 0)", offset: 0.48, easing: EASE_EDITORIAL },
  { clipPath: "inset(0 0 100% 0)" },
];
export const WINK_COOLDOWN_MS = 500;
export const WINK_THRESHOLDS: [number, number] = [0.3, 0.68];
