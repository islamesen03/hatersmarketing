/**
 * Normalised scene progress.
 *
 * A scene's stage is unpinned; its progress `p` runs from 0 to 1 while the stage's
 * vertical centre travels from 85% to 25% of the usable viewport (the viewport below the
 * sticky header). The same numbers feed the native ViewTimeline (as insets around a
 * zero-height pivot at the stage centre) and the JavaScript fallback, so both drivers
 * agree exactly.
 */
export const PROGRESS_START = 0.85;
export const PROGRESS_END = 0.25;

export type ProgressGeometry = {
  /** Height of the scroll viewport in CSS px (window.innerHeight). */
  viewportHeight: number;
  /** Height of the sticky header in CSS px; the usable viewport starts below it. */
  headerHeight: number;
};

export function usableViewport({ viewportHeight, headerHeight }: ProgressGeometry): number {
  return Math.max(1, viewportHeight - headerHeight);
}

/**
 * Progress for a stage whose centre sits `centerY` px from the top of the viewport.
 * p = clamp((0.85·V − (centerY − H)) / (0.60·V), 0, 1) with V the usable viewport.
 */
export function sceneProgress(centerY: number, geometry: ProgressGeometry): number {
  const v = usableViewport(geometry);
  const y = centerY - geometry.headerHeight;
  const p = (PROGRESS_START * v - y) / ((PROGRESS_START - PROGRESS_END) * v);
  return p <= 0 ? 0 : p >= 1 ? 1 : p;
}

/**
 * Insets for a ViewTimeline whose subject is the zero-height pivot at the stage centre:
 * `cover 0%` then means "pivot at 85% of the usable viewport" and `cover 100%` "pivot at
 * 25%", i.e. exactly the range of `sceneProgress`.
 */
export function timelineInsets(geometry: ProgressGeometry): { top: number; bottom: number } {
  const v = usableViewport(geometry);
  return {
    top: geometry.headerHeight + PROGRESS_END * v,
    bottom: (1 - PROGRESS_START) * v,
  };
}

/** Is the stage close enough to the viewport that its animations should exist? */
export function isNearViewport(rect: { top: number; bottom: number }, viewportHeight: number, margin = 0.5): boolean {
  const pad = viewportHeight * margin;
  return rect.bottom > -pad && rect.top < viewportHeight + pad;
}

export function clamp01(value: number): number {
  return value <= 0 ? 0 : value >= 1 ? 1 : value;
}
