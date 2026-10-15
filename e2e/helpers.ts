import { expect, type Page } from "@playwright/test";

export type SceneId = "heart-box" | "cards" | "owl" | "pawns";

/** Scroll so that a scene's stage centre sits at the given normalised progress. */
export async function scrollToProgress(page: Page, scene: SceneId, p: number) {
  await page.evaluate(
    ([id, target]) => {
      const stage = document.querySelector<HTMLElement>(`[data-scene="${id}"]`);
      if (!stage) throw new Error(`no scene ${id}`);
      const header = document.querySelector("header");
      const h = header ? header.getBoundingClientRect().height : 0;
      const v = window.innerHeight - h;
      const rect = stage.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const centerY = h + 0.85 * v - (target as number) * 0.6 * v;
      window.scrollTo({ top: Math.round(docTop + rect.height / 2 - centerY), behavior: "instant" });
    },
    [scene, p] as const,
  );
  // two frames: one for the scroll event batch, one for the timeline to settle
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

export async function sceneState(page: Page, scene: SceneId) {
  return page.evaluate((id) => {
    const stage = document.querySelector<HTMLElement>(`[data-scene="${id}"]`)!;
    const layers = Array.from(stage.querySelectorAll<HTMLElement>("[data-layer]")).map((el) => {
      const img = el.querySelector("img");
      const anims = el.getAnimations();
      return {
        name: el.dataset.layer!,
        role: el.dataset.role!,
        transform: getComputedStyle(el).transform,
        rect: el.getBoundingClientRect().toJSON() as DOMRect,
        loaded: !!img && img.complete && img.naturalWidth > 0,
        animations: anims.map((a) => ({
          timeline: a.timeline ? a.timeline.constructor.name : "none",
          playState: a.playState,
          currentTime: typeof a.currentTime === "number" ? a.currentTime : a.currentTime?.toString() ?? null,
        })),
      };
    });
    const rect = stage.getBoundingClientRect();
    return {
      state: stage.dataset.sceneState ?? null,
      driver: stage.dataset.sceneDriver ?? null,
      progress: stage.dataset.sceneProgress ? Number(stage.dataset.sceneProgress) : null,
      wink: stage.dataset.wink ?? null,
      stageRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      layers,
    };
  }, scene);
}

export async function waitForScene(page: Page, scene: SceneId, state = "ready") {
  await expect(page.locator(`[data-scene="${scene}"]`)).toHaveAttribute("data-scene-state", state);
  // and every layer image decoded (lazy layers start loading when the scene comes near)
  await page.waitForFunction(
    (id) => Array.from(document.querySelectorAll<HTMLImageElement>(`[data-scene="${id}"] img`)).every((img) => img.complete && img.naturalWidth > 0),
    scene,
    { timeout: 15_000 },
  );
}

/** translateY component of a computed 2D/3D transform matrix. */
export function translateY(transform: string): number {
  if (!transform || transform === "none") return 0;
  const nums = transform.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)?.map(Number) ?? [];
  if (transform.startsWith("matrix3d")) return nums[13] ?? 0;
  return nums[5] ?? 0;
}

export function translateX(transform: string): number {
  if (!transform || transform === "none") return 0;
  const nums = transform.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)?.map(Number) ?? [];
  if (transform.startsWith("matrix3d")) return nums[12] ?? 0;
  return nums[4] ?? 0;
}

export async function motionMode(page: Page) {
  return page.evaluate(() => document.documentElement.dataset.motion ?? null);
}

export async function gotoAndSettle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", /native|fallback|reduced|static/);
}
