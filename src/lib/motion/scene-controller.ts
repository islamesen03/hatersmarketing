import type { SceneId } from "@/content/types";
import { detectCapabilities, type MotionCapabilities } from "./capabilities";
import {
  WINK_COOLDOWN_MS,
  WINK_DURATION_MS,
  WINK_KEYFRAMES,
  WINK_THRESHOLDS,
  choreography,
  type LayerKeyframes,
} from "./choreography";
import { onReducedMotionChange, prefersReducedMotion } from "./preferences";
import { sceneProgress, timelineInsets, type ProgressGeometry } from "./progress";
import { WinkMachine, type WinkEye } from "./wink-machine";

/** Virtual duration of a scrubbed fallback animation; currentTime = p * DURATION. */
const DURATION = 1000;
const COMPACT_QUERY = "(max-width: 47.99rem)";
const SCENE_IDS: ReadonlySet<string> = new Set<SceneId>(["heart-box", "cards", "owl", "pawns"]);

type SceneEntry = {
  id: SceneId;
  stage: HTMLElement;
  pivot: HTMLElement | null;
  layers: Map<string, HTMLElement>;
  animations: Animation[];
  near: boolean;
  lastP: number;
  failed: boolean;
  wink: { machine: WinkMachine; lids: Record<WinkEye, HTMLElement>; current: Animation | null } | null;
  cleanup: Array<() => void>;
};

/**
 * One controller per page view. It owns every scroll scene and every text entrance,
 * one passive scroll subscription, one IntersectionObserver for activation, and the
 * runtime listeners (resize, breakpoint, visibility, reduced motion, bfcache).
 *
 * Exactly one driver owns a scene's transforms: a native ViewTimeline when the browser
 * supports it, otherwise the scroll-driven scrub in `tick()`. Both derive from the same
 * keyframes and the same progress definition.
 */
export class MotionController {
  private readonly root: ParentNode;
  private caps: MotionCapabilities = { waapi: false, viewTimeline: false };
  private entries: SceneEntry[] = [];
  private near = new Set<SceneEntry>();
  private io: IntersectionObserver | null = null;
  private frame = 0;
  private resizeTimer = 0;
  private compact = false;
  private compactQuery: MediaQueryList | null = null;
  private geometry: ProgressGeometry = { viewportHeight: 1, headerHeight: 72 };
  private listeners: Array<() => void> = [];
  private running = false;
  private entrances: Entrances | null = null;

  constructor(root: ParentNode = document) {
    this.root = root;
  }

  start(): void {
    if (this.running || typeof window === "undefined") return;
    this.running = true;
    const reduced = prefersReducedMotion();
    this.caps = detectCapabilities();
    this.refreshGeometry();
    this.compactQuery = window.matchMedia(COMPACT_QUERY);
    this.compact = this.compactQuery.matches;

    document.documentElement.dataset.motion = reduced ? "reduced" : !this.caps.waapi ? "static" : this.caps.viewTimeline ? "native" : "fallback";

    this.entrances = new Entrances(this.root, reduced);
    this.listeners.push(onReducedMotionChange(() => this.restart()));
    const onCompact = () => this.restart();
    this.compactQuery.addEventListener("change", onCompact);
    this.listeners.push(() => this.compactQuery?.removeEventListener("change", onCompact));
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) this.restart();
    };
    window.addEventListener("pageshow", onPageShow);
    this.listeners.push(() => window.removeEventListener("pageshow", onPageShow));

    if (reduced || !this.caps.waapi) return;
    this.mountScenes();
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    window.clearTimeout(this.resizeTimer);
    this.io?.disconnect();
    this.io = null;
    for (const entry of this.entries) this.teardownEntry(entry);
    this.entries = [];
    this.near.clear();
    this.entrances?.destroy();
    this.entrances = null;
    for (const off of this.listeners) off();
    this.listeners = [];
    // `data-motion` on <html> is informational and always rewritten by the next start();
    // it is left in place because another page's controller may already own it.
  }

  private restart(): void {
    this.stop();
    this.start();
  }

  // ---- scenes ------------------------------------------------------------------

  private mountScenes(): void {
    const stages = this.root.querySelectorAll<HTMLElement>("[data-scene]");
    if (stages.length === 0) return;
    this.io = new IntersectionObserver((records) => this.onNear(records), { rootMargin: "50% 0px 50% 0px" });
    for (const stage of stages) {
      const id = stage.dataset.scene ?? "";
      if (!SCENE_IDS.has(id)) continue;
      const layers = new Map<string, HTMLElement>();
      for (const el of stage.querySelectorAll<HTMLElement>("[data-layer]")) layers.set(el.dataset.layer ?? "", el);
      const entry: SceneEntry = {
        id: id as SceneId,
        stage,
        pivot: stage.querySelector<HTMLElement>(".scene__pivot"),
        layers,
        animations: [],
        near: false,
        lastP: -1,
        failed: false,
        wink: null,
        cleanup: [],
      };
      this.watchAssets(entry);
      if (entry.id === "owl") this.setupWink(entry);
      this.entries.push(entry);
      stage.dataset.sceneState = "idle";
      this.io.observe(stage);
    }
    const onScroll = () => this.schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    this.listeners.push(() => window.removeEventListener("scroll", onScroll));
    const onResize = () => {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.onResize(), 120);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    this.listeners.push(() => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        for (const entry of this.entries) entry.wink?.machine.cancel();
      } else {
        this.schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    this.listeners.push(() => document.removeEventListener("visibilitychange", onVisibility));
  }

  private onNear(records: IntersectionObserverEntry[]): void {
    for (const record of records) {
      const entry = this.entries.find((e) => e.stage === record.target);
      if (!entry || entry.failed) continue;
      if (record.isIntersecting && !entry.near) {
        entry.near = true;
        this.near.add(entry);
        this.createAnimations(entry);
      } else if (!record.isIntersecting && entry.near) {
        entry.near = false;
        this.near.delete(entry);
        this.cancelAnimations(entry);
        entry.wink?.machine.setVisible(false);
        entry.stage.dataset.sceneState = "idle";
        entry.stage.classList.remove("is-active");
      }
    }
    this.schedule();
  }

  private createAnimations(entry: SceneEntry): void {
    this.cancelAnimations(entry);
    // Eyelids are clipped away until they wink, so lazy loading would never fetch them:
    // fetch them now that the scene is near (not at page load).
    if (entry.wink) {
      for (const lid of Object.values(entry.wink.lids)) {
        const img = lid.querySelector("img");
        if (img && !img.complete) img.loading = "eager";
      }
    }
    const frames: LayerKeyframes = choreography(entry.id, { compact: this.compact });
    const rect = entry.stage.getBoundingClientRect();
    const p = sceneProgress(rect.top + rect.height / 2, this.geometry);
    let timeline: AnimationTimeline | null = null;
    if (this.caps.viewTimeline && entry.pivot) {
      const insets = timelineInsets(this.geometry);
      try {
        timeline = new ViewTimeline({ subject: entry.pivot, axis: "block", inset: `${insets.top}px ${insets.bottom}px` });
      } catch {
        timeline = null;
      }
    }
    for (const [name, keyframes] of Object.entries(frames)) {
      const el = entry.layers.get(name);
      if (!el) continue;
      try {
        if (timeline) {
          entry.animations.push(el.animate(keyframes, { timeline, fill: "both", rangeStart: "cover 0%", rangeEnd: "cover 100%" }));
        } else {
          const anim = el.animate(keyframes, { duration: DURATION, fill: "both", easing: "linear" });
          anim.pause();
          anim.currentTime = p * DURATION;
          entry.animations.push(anim);
        }
      } catch {
        // A layer that cannot animate simply stays in its static pose.
      }
    }
    entry.lastP = -1;
    entry.stage.classList.add("is-active");
    entry.stage.dataset.sceneDriver = timeline ? "native" : "fallback";
    entry.stage.dataset.sceneState = entry.animations.length > 0 ? "ready" : "static";
  }

  private cancelAnimations(entry: SceneEntry): void {
    for (const anim of entry.animations) {
      try {
        anim.cancel();
      } catch {
        /* already gone */
      }
    }
    entry.animations = [];
  }

  private teardownEntry(entry: SceneEntry): void {
    this.cancelAnimations(entry);
    entry.wink?.machine.destroy();
    for (const off of entry.cleanup) off();
    entry.cleanup = [];
    entry.stage.classList.remove("is-active");
    delete entry.stage.dataset.sceneState;
    delete entry.stage.dataset.sceneDriver;
    delete entry.stage.dataset.sceneProgress;
  }

  private watchAssets(entry: SceneEntry): void {
    const fail = () => {
      if (entry.failed) return;
      entry.failed = true;
      this.near.delete(entry);
      this.cancelAnimations(entry);
      entry.wink?.machine.cancel();
      entry.stage.classList.remove("is-active");
      entry.stage.dataset.sceneState = "static";
    };
    for (const img of entry.stage.querySelectorAll<HTMLImageElement>("img")) {
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) {
        fail();
        return;
      }
      img.addEventListener("error", fail, { once: true });
      entry.cleanup.push(() => img.removeEventListener("error", fail));
    }
  }

  private setupWink(entry: SceneEntry): void {
    const left = entry.layers.get("lid-viewer-left");
    const right = entry.layers.get("lid-viewer-right");
    if (!left || !right) return;
    const lids: Record<WinkEye, HTMLElement> = { viewerLeft: left, viewerRight: right };
    const state = { machine: null as unknown as WinkMachine, lids, current: null as Animation | null };
    state.machine = new WinkMachine({
      thresholds: WINK_THRESHOLDS,
      busyMs: WINK_DURATION_MS + WINK_COOLDOWN_MS,
      now: () => performance.now(),
      setTimeout: (fn, ms) => window.setTimeout(fn, ms),
      clearTimeout: (id) => window.clearTimeout(id),
      play: (eye) => {
        state.current?.cancel();
        const img = lids[eye].querySelector("img");
        // A lid whose texture is not ready would wink with nothing: keep the eye open instead.
        if (!img || !img.complete || img.naturalWidth === 0) return;
        try {
          state.current = lids[eye].animate(WINK_KEYFRAMES, { duration: WINK_DURATION_MS, fill: "none" });
          entry.stage.dataset.wink = eye;
          state.current.finished
            .then(() => {
              if (entry.stage.dataset.wink === eye) delete entry.stage.dataset.wink;
            })
            .catch(() => {});
        } catch {
          state.current = null;
        }
      },
      reset: () => {
        state.current?.cancel();
        state.current = null;
        delete entry.stage.dataset.wink;
      },
    });
    entry.wink = state;
  }

  // ---- progress -------------------------------------------------------------------

  private schedule(): void {
    if (this.frame || this.near.size === 0) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.tick();
    });
  }

  private tick(): void {
    const { viewportHeight, headerHeight } = this.geometry;
    // Batch the reads, then the writes.
    const reads = Array.from(this.near, (entry) => ({ entry, rect: entry.stage.getBoundingClientRect() }));
    for (const { entry, rect } of reads) {
      const p = sceneProgress(rect.top + rect.height / 2, this.geometry);
      const visible = rect.bottom > headerHeight && rect.top < viewportHeight;
      if (!this.caps.viewTimeline) {
        for (const anim of entry.animations) anim.currentTime = p * DURATION;
      }
      if (Math.abs(p - entry.lastP) >= 0.004 || entry.lastP < 0) {
        entry.lastP = p;
        entry.stage.dataset.sceneProgress = p.toFixed(3);
      }
      if (entry.wink) {
        entry.wink.machine.setVisible(visible, p);
        entry.wink.machine.update(p);
      }
    }
  }

  private refreshGeometry(): void {
    const header = document.querySelector<HTMLElement>("header");
    this.geometry = {
      viewportHeight: window.innerHeight || document.documentElement.clientHeight || 1,
      headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 72,
    };
  }

  private onResize(): void {
    this.refreshGeometry();
    for (const entry of this.near) this.createAnimations(entry);
    this.schedule();
  }
}

/**
 * Once-per-visit text entrances. Elements already in (or above) the viewport when the
 * page is enhanced are never armed, so nothing flashes; everything below is hidden and
 * released on intersection. Reduced motion or a failed enhancement leaves text visible.
 */
class Entrances {
  private io: IntersectionObserver | null = null;
  private armed = new Set<HTMLElement>();

  constructor(root: ParentNode, reduced: boolean) {
    const elements = root.querySelectorAll<HTMLElement>("[data-enter]");
    if (reduced || elements.length === 0 || typeof IntersectionObserver !== "function") {
      for (const el of elements) delete el.dataset.enterState;
      return;
    }
    this.io = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (!record.isIntersecting) continue;
          const el = record.target as HTMLElement;
          el.dataset.enterState = "in";
          this.armed.delete(el);
          this.io?.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    const viewportHeight = window.innerHeight;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const below = rect.top >= viewportHeight;
      if (!below) {
        delete el.dataset.enterState;
        continue;
      }
      el.dataset.enterState = "armed";
      this.armed.add(el);
      this.io.observe(el);
    }
  }

  destroy(): void {
    this.io?.disconnect();
    this.io = null;
    for (const el of this.armed) delete el.dataset.enterState;
    this.armed.clear();
  }
}
