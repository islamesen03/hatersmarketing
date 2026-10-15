/**
 * Feature detection for the exact APIs the scenes use. Tests simulate an older browser by
 * deleting `window.ViewTimeline` before any script runs, so detection must go through the
 * globals (never cached module-level constants) and must not leave a half-built timeline.
 */
export type MotionCapabilities = {
  /** Web Animations API with `fill`/`currentTime` control (every scene needs this). */
  waapi: boolean;
  /** Native scroll-driven animations via `ViewTimeline` + animation range options. */
  viewTimeline: boolean;
};

export function detectCapabilities(): MotionCapabilities {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { waapi: false, viewTimeline: false };
  }
  const waapi = typeof Element.prototype.animate === "function" && typeof Animation === "function";
  let viewTimeline = false;
  if (waapi && typeof (window as Window & { ViewTimeline?: unknown }).ViewTimeline === "function") {
    try {
      const probe = document.createElement("div");
      // A detached subject is fine for construction; the timeline is discarded immediately.
      const timeline = new ViewTimeline({ subject: probe, axis: "block" });
      viewTimeline =
        typeof timeline === "object" &&
        "rangeStart" in Animation.prototype &&
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("animation-timeline: view()");
    } catch {
      viewTimeline = false;
    }
  }
  return { waapi, viewTimeline };
}
