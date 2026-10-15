/**
 * The owl's wink state machine. Pure logic with an injected clock and scheduler so it can
 * be unit-tested deterministically; the DOM/animation side lives in the scene controller.
 *
 * Rules (see docs/motion/MOTION_SPEC.md):
 * - A forward crossing of threshold[i] within one visit fires that eye once:
 *   viewer-right first, viewer-left second.
 * - While a wink plays or its cooldown runs, at most one further wink is queued; it plays
 *   afterwards only if the stage is still visible, otherwise it is dropped.
 * - Reversals never replay: thresholds stay consumed until the stage leaves the viewport,
 *   which re-arms both for the next forward visit.
 * - Becoming visible mid-scene (mount, restored scroll) consumes every threshold already
 *   passed without playing anything.
 * - Hiding (scroll exit, tab hidden, reduced motion, teardown) cancels queued work and
 *   restores open eyes.
 */
export type WinkEye = "viewerRight" | "viewerLeft";

export type WinkMachineOptions = {
  thresholds?: [number, number];
  /** Hysteresis band above a threshold before it counts as crossed (jitter guard). */
  hysteresis?: number;
  /** Total time one wink keeps the state busy: play time plus cooldown, in ms. */
  busyMs?: number;
  now: () => number;
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  /** Start playing a wink on the given eye. */
  play: (eye: WinkEye) => void;
  /** Cancel any in-flight wink and show both eyes open. */
  reset: () => void;
};

const EYE_ORDER: WinkEye[] = ["viewerRight", "viewerLeft"];

export class WinkMachine {
  private readonly thresholds: [number, number];
  private readonly hysteresis: number;
  private readonly busyMs: number;
  private readonly opts: WinkMachineOptions;

  private visible = false;
  private lastP: number | null = null;
  private consumed = [false, false];
  private busyUntil = 0;
  private timer: number | null = null;
  private queued: WinkEye | null = null;
  private playing = false;

  constructor(opts: WinkMachineOptions) {
    this.opts = opts;
    this.thresholds = opts.thresholds ?? [0.3, 0.68];
    this.hysteresis = opts.hysteresis ?? 0.02;
    this.busyMs = opts.busyMs ?? 820; // ~320ms wink + 500ms cooldown
  }

  /** Stage enters or leaves the viewport. Leaving re-arms both thresholds. */
  setVisible(visible: boolean, currentP?: number): void {
    if (visible === this.visible) {
      if (visible && typeof currentP === "number") this.update(currentP);
      return;
    }
    this.visible = visible;
    if (!visible) {
      this.cancel();
      this.consumed = [false, false];
      this.lastP = null;
      return;
    }
    // Fresh visit: whatever is already behind us is consumed silently.
    const p = typeof currentP === "number" ? currentP : 0;
    this.lastP = p;
    this.consumed = this.thresholds.map((t) => p >= t) as [boolean, boolean];
  }

  /** Progress changed. Fires at most one wink per threshold per visit. */
  update(p: number): void {
    if (!this.visible) return;
    if (this.lastP === null) {
      this.lastP = p;
      this.consumed = this.thresholds.map((t) => p >= t) as [boolean, boolean];
      return;
    }
    const forward = p > this.lastP;
    if (forward) {
      for (let i = 0; i < this.thresholds.length; i += 1) {
        const t = this.thresholds[i];
        if (!this.consumed[i] && this.lastP < t + this.hysteresis && p >= t + this.hysteresis) {
          this.consumed[i] = true;
          this.request(EYE_ORDER[i]);
        }
      }
    }
    this.lastP = p;
  }

  /** Hidden tab, reduced motion, asset failure, teardown. */
  cancel(): void {
    if (this.timer !== null) {
      this.opts.clearTimeout(this.timer);
      this.timer = null;
    }
    this.queued = null;
    if (this.playing) {
      this.playing = false;
      this.opts.reset();
    }
    this.busyUntil = 0;
  }

  destroy(): void {
    this.cancel();
    this.visible = false;
  }

  get state() {
    return {
      visible: this.visible,
      consumed: [...this.consumed] as [boolean, boolean],
      queued: this.queued,
      playing: this.playing,
    };
  }

  private request(eye: WinkEye): void {
    const now = this.opts.now();
    if (now >= this.busyUntil && !this.playing) {
      this.start(eye, now);
      return;
    }
    // Queue at most one; a newer request replaces an older queued one.
    this.queued = eye;
    if (this.timer === null) {
      this.timer = this.opts.setTimeout(() => this.flush(), Math.max(0, this.busyUntil - now));
    }
  }

  private flush(): void {
    this.timer = null;
    const eye = this.queued;
    this.queued = null;
    if (!eye || !this.visible) return;
    this.start(eye, this.opts.now());
  }

  private start(eye: WinkEye, now: number): void {
    this.playing = true;
    this.busyUntil = now + this.busyMs;
    this.opts.play(eye);
    this.timer = this.opts.setTimeout(() => {
      this.playing = false;
      this.timer = null;
      if (this.queued) this.flush();
    }, this.busyMs);
  }
}
