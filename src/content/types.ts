/** A headline is a list of lines; `accent` marks the uncomfortable part, set in red. */
export type HeadlineLine = { text: string; accent?: boolean };
export type Headline = HeadlineLine[];

/** The four object photographs that have separable, scroll-driven layers. */
export type SceneId = "heart-box" | "cards" | "owl" | "pawns";

export type Picture = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Background of the photograph, so layouts can sit it on a matching or contrasting field. */
  tone: "cream" | "ink" | "red";
  /**
   * Explicit scene identity. A figure with a scene renders the layered, scroll-driven
   * composition (src/content/motion-assets.ts); without one it stays an ordinary image.
   */
  scene?: SceneId;
};

export type Faq = { q: string; a: string };
