import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/**
 * Automated accessibility scan of the routes the motion upgrade touches. Serious and
 * critical findings fail; the rest are reported in the test output for review. An
 * automated scan is not a full audit (manual keyboard and screen-reader checks are in
 * docs/motion/REPORT.md).
 *
 * Two passes per route: with reduced motion (every element at its final pose, so the
 * scan covers all content and colours) and with motion on at the top of the page after
 * the load reveals have finished (nothing is mid-fade there; scroll-linked reveals
 * further down are at opacity 0 and therefore not evaluated). axe measures the colour of
 * text that is still fading in, so scanning mid-scroll would only report the transition.
 */
const routes = ["/", "/hizmetler/strateji-ve-marka-konumlandirma", "/hizmetler/kreatif-konsept-ve-reklam-tasarimi", "/yaklasimimiz"];

async function scan(page: import("@playwright/test").Page, label: string, exclude: string[] = []) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]);
  for (const selector of exclude) builder = builder.exclude(selector);
  const results = await builder.analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const others = results.violations.filter((v) => v.impact !== "serious" && v.impact !== "critical");
  if (others.length) {
    console.log(`axe (${label}) minor/moderate:`, others.map((v) => `${v.id} x${v.nodes.length}`).join(", "));
  }
  expect(serious.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(" ")) }))).toEqual([]);
}

test.describe("axe, reduced motion (every element at its final pose)", () => {
  test.use({ reducedMotion: "reduce" });
  for (const route of routes) {
    test(`axe static: ${route}`, async ({ page }) => {
      await gotoAndSettle(page, route);
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
      await scan(page, `${route} reduced`);
    });
  }
});

test.describe("axe, motion on (top of page after the load reveals)", () => {
  for (const route of routes) {
    test(`axe enhanced: ${route}`, async ({ page }) => {
      await gotoAndSettle(page, route);
      await page.waitForFunction(() =>
        document.getAnimations().every((a) => {
          if (a.playState === "finished") return true;
          if (a.timeline && a.timeline.constructor.name !== "DocumentTimeline") return true;
          const timing = a.effect?.getTiming();
          return !timing || timing.iterations === Infinity;
        }),
      );
      await page.waitForTimeout(200);
      // Baseline finding, unchanged by this upgrade: the manifesto's inverted first line
      // (`[data-upright]`, main @2102905) rests at opacity 0.35 while it is still below the
      // fold and only reaches full opacity as it scrolls in; axe reads that offscreen pose
      // as a contrast failure. The reduced-motion pass above covers the same text at full
      // opacity. Reported in docs/motion/REPORT.md §6.
      await scan(page, `${route} enhanced`, ["[data-upright]"]);
    });
  }
});

test("keyboard: skip link, header CTA, scene stages are not focus traps", async ({ page }) => {
  await gotoAndSettle(page, "/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "İçeriğe geç" })).toBeFocused();
  // Nothing inside a scene stage is focusable and no layer intercepts the pointer.
  const focusableInScenes = await page.evaluate(
    () => document.querySelectorAll('[data-scene] a, [data-scene] button, [data-scene] [tabindex]:not([tabindex="-1"])').length,
  );
  expect(focusableInScenes).toBe(0);
  const pointerBlocked = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-scene] .scene__layer")).every((el) => getComputedStyle(el).pointerEvents === "none"),
  );
  expect(pointerBlocked).toBe(true);
});
