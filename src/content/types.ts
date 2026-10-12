/** A headline is a list of lines; `accent` marks the uncomfortable part, set in red. */
export type HeadlineLine = { text: string; accent?: boolean };
export type Headline = HeadlineLine[];

export type Picture = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Background of the photograph, so layouts can sit it on a matching or contrasting field. */
  tone: "cream" | "ink" | "red";
};

export type Faq = { q: string; a: string };
