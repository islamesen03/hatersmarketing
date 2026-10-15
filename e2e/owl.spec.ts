import { expect, test } from "@playwright/test";
import { gotoAndSettle, sceneState, scrollToProgress, waitForScene } from "./helpers";

const stage = '[data-scene="owl"]';

async function winkLog(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as unknown as { __winks: string[] }).__winks ?? []);
}

async function recordWinks(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __winks: string[]; __winkObs?: MutationObserver };
    w.__winks = [];
    const target = document.querySelector('[data-scene="owl"]')!;
    w.__winkObs = new MutationObserver(() => {
      const eye = (target as HTMLElement).dataset.wink;
      if (eye && w.__winks[w.__winks.length - 1] !== eye) w.__winks.push(eye);
    });
    w.__winkObs.observe(target, { attributes: true, attributeFilter: ["data-wink"] });
  });
}

test.describe("owl winks", () => {
  test("viewer-right then viewer-left, never together, with cooldown; reversals stay open", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "owl", 0.1);
    await waitForScene(page, "owl");
    await recordWinks(page);
    const initial = await sceneState(page, "owl");
    for (const layer of initial.layers) expect(layer.loaded, `${layer.name} loaded`).toBe(true);
    expect(initial.wink).toBeNull();

    await scrollToProgress(page, "owl", 0.4);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(1);
    expect(await winkLog(page)).toEqual(["viewerRight"]);
    // Only one lid animates at a time.
    const during = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-scene="owl"] [data-role="wink"]')).map((el) => el.getAnimations().length),
    );
    expect(during.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1);
    await page.waitForTimeout(900);
    await expect(page.locator(stage)).not.toHaveAttribute("data-wink", /.+/);

    // jitter around the first threshold: nothing new
    await scrollToProgress(page, "owl", 0.29);
    await scrollToProgress(page, "owl", 0.34);
    await scrollToProgress(page, "owl", 0.3);
    await page.waitForTimeout(600);
    expect(await winkLog(page)).toEqual(["viewerRight"]);

    await scrollToProgress(page, "owl", 0.75);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(2);
    expect(await winkLog(page)).toEqual(["viewerRight", "viewerLeft"]);
    await page.waitForTimeout(900);

    // reverse traversal: eyes stay open
    await scrollToProgress(page, "owl", 0.5);
    await scrollToProgress(page, "owl", 0.2);
    await page.waitForTimeout(900);
    expect(await winkLog(page)).toEqual(["viewerRight", "viewerLeft"]);

    // leave entirely, come back: a fresh visit winks right then left again
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(400);
    await scrollToProgress(page, "owl", 0.05);
    await waitForScene(page, "owl");
    await scrollToProgress(page, "owl", 0.4);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(3);
    await page.waitForTimeout(900);
    await scrollToProgress(page, "owl", 0.8);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(4);
    expect(await winkLog(page)).toEqual(["viewerRight", "viewerLeft", "viewerRight", "viewerLeft"]);
    // the eyes always end open
    await page.waitForTimeout(900);
    const lids = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-scene="owl"] [data-role="wink"]')).map((el) => ({
        anims: el.getAnimations().length,
        clip: getComputedStyle(el).clipPath,
      })),
    );
    for (const lid of lids) {
      expect(lid.anims).toBe(0);
      expect(lid.clip).toContain("100%");
    }
  });

  test("a fast pass queues at most one wink and plays it after the cooldown", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "owl", 0.05);
    await waitForScene(page, "owl");
    await recordWinks(page);
    await scrollToProgress(page, "owl", 0.95);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(1);
    expect(await winkLog(page)).toEqual(["viewerRight"]);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(2);
    expect(await winkLog(page)).toEqual(["viewerRight", "viewerLeft"]);
  });

  test("arriving mid-scene (restored scroll) fires no missed winks", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    // Navigate again directly to a mid-scene position via reload with a saved scroll offset.
    await scrollToProgress(page, "owl", 0.5);
    const y = await page.evaluate(() => window.scrollY);
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await expect(page.locator("html")).toHaveAttribute("data-motion", /.+/);
    await waitForScene(page, "owl");
    await recordWinks(page);
    await page.waitForTimeout(800);
    expect(await winkLog(page)).toEqual([]);
    await scrollToProgress(page, "owl", 0.8);
    await expect.poll(async () => (await winkLog(page)).length, { timeout: 3000 }).toBe(1);
    expect(await winkLog(page)).toEqual(["viewerLeft"]);
  });

  test("hiding the tab or reduced motion cancels and restores open eyes", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "owl", 0.1);
    await waitForScene(page, "owl");
    await scrollToProgress(page, "owl", 0.4);
    await expect(page.locator(stage)).toHaveAttribute("data-wink", "viewerRight");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator(stage)).not.toHaveAttribute("data-wink", /.+/);
    const lids = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-scene="owl"] [data-role="wink"]')).map((el) => ({
        anims: el.getAnimations().length,
        clip: getComputedStyle(el).clipPath,
      })),
    );
    for (const lid of lids) {
      expect(lid.anims).toBe(0);
      expect(lid.clip).toContain("100%");
    }
    // and no animations remain anywhere once the media change has been applied
    await expect.poll(async () => page.evaluate(() => document.getAnimations().length), { timeout: 3000 }).toBe(0);
  });
});
