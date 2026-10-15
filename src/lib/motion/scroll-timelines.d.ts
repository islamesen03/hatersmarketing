/**
 * Scroll-driven animation types that TypeScript 5.9's DOM lib does not declare yet
 * (ScrollTimeline / ViewTimeline and the range options on `Element.animate`).
 * Spec: https://drafts.csswg.org/scroll-animations-1/
 */
interface ScrollTimelineOptions {
  source?: Element | null;
  axis?: "block" | "inline" | "x" | "y";
}

declare class ScrollTimeline extends AnimationTimeline {
  constructor(options?: ScrollTimelineOptions);
  readonly source: Element | null;
  readonly axis: "block" | "inline" | "x" | "y";
}

interface ViewTimelineOptions extends ScrollTimelineOptions {
  subject?: Element;
  inset?: string | Array<string | CSSNumericValue>;
}

declare class ViewTimeline extends ScrollTimeline {
  constructor(options?: ViewTimelineOptions);
  readonly subject: Element;
  readonly startOffset: CSSNumericValue;
  readonly endOffset: CSSNumericValue;
}

interface KeyframeAnimationOptions {
  timeline?: AnimationTimeline | null;
  rangeStart?: string;
  rangeEnd?: string;
}

interface Animation {
  rangeStart?: string | object;
  rangeEnd?: string | object;
}
