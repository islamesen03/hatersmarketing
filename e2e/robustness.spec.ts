import { expect, test } from "@playwright/test";
import { gotoAndSettle, motionMode, sceneState, scrollToProgress, translateY, waitForScene } from "./helpers";

test.describe("text entrances", () => {
  test("headlines below the fold arrive from both sides and keep their words", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const mode = await motionMode(page);
    test.skip(mode === "reduced", "entrances are disabled under reduced motion");
    const headline = page.locator('[data-enter="sides"]').first();
    await expect(headline).toHaveAttribute("data-enter-state", "armed");
    const lines = headline.locator(".enter-line");
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveClass(/enter-line--left/);
    await expect(lines.nth(1)).toHaveClass(/enter-line--right/);
    // hidden while armed: translated and transparent
    const armed = await lines.nth(0).locator("span").evaluate((el) => ({ opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform }));
    expect(armed.opacity).toBe("0");
    expect(armed.transform).not.toBe("none");
    await headline.scrollIntoViewIfNeeded();
    await expect(headline).toHaveAttribute("data-enter-state", "in");
    await expect.poll(async () => lines.nth(1).locator("span").evaluate((el) => getComputedStyle(el).opacity), { timeout: 4000 }).toBe("1");
    const finalTransform = await lines.nth(1).locator("span").evaluate((el) => getComputedStyle(el).transform);
    expect(finalTransform).toBe("none");
    // accessible text intact, Turkish letters and spacing preserved
    await expect(headline).toHaveText("Beğeni geldi. Sipariş?");
    // scrolling back a little must not hide it again
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(200);
    await expect(headline).toHaveAttribute("data-enter-state", "in");
  });

  test("whole-block titles enter from the left once", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const title = page.locator("#services-title");
    await expect(title).toHaveAttribute("data-enter-state", "armed");
    await title.scrollIntoViewIfNeeded();
    await expect(title).toHaveAttribute("data-enter-state", "in");
    await expect(title).toHaveText("Beş iş. Tek soru.");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no scene animations, static poses, everything visible, no armed text", async ({ page }) => {
    await gotoAndSettle(page, "/");
    expect(await motionMode(page)).toBe("reduced");
    expect(await page.locator("[data-enter-state]").count()).toBe(0);
    await scrollToProgress(page, "heart-box", 0.5);
    await page.waitForTimeout(300);
    const state = await sceneState(page, "heart-box");
    expect(state.state).toBeNull();
    for (const layer of state.layers) {
      expect(layer.animations.length).toBe(0);
      expect(layer.transform).toBe("none");
    }
    // the still image: balloon above the box, lids hidden
    await scrollToProgress(page, "owl", 0.5);
    const lids = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-scene="owl"] [data-role="wink"]')).map((el) => getComputedStyle(el).clipPath),
    );
    for (const clip of lids) expect(clip).toContain("100%");
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    // gallery navigation does not smooth-scroll
    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(behavior).toBe("auto");
  });
});

test.describe("runtime preference change", () => {
  test("switching reduce on while the page is open tears motion down; switching off restores it", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "heart-box", 0.5);
    await waitForScene(page, "heart-box");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect.poll(async () => page.evaluate(() => document.getAnimations().length), { timeout: 3000 }).toBe(0);
    const still = await sceneState(page, "heart-box");
    expect(still.layers[1].transform).toBe("none");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", /native|fallback/);
    await scrollToProgress(page, "heart-box", 0.5);
    await waitForScene(page, "heart-box");
  });
});

test.describe("fallback driver", () => {
  test("without ViewTimeline the shared scroll driver scrubs the same keyframes", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      // Simulate a browser without scroll-driven animations.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).ViewTimeline;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).ScrollTimeline;
    });
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "fallback");
    await scrollToProgress(page, "heart-box", 0);
    await waitForScene(page, "heart-box");
    const at0 = await sceneState(page, "heart-box");
    expect(at0.driver).toBe("fallback");
    const balloon0 = at0.layers.find((l) => l.name === "balloon")!;
    expect(balloon0.animations.length).toBe(1);
    expect(balloon0.animations[0].timeline).toBe("DocumentTimeline");
    expect(balloon0.animations[0].playState).toBe("paused");
    expect(translateY(balloon0.transform)).toBeGreaterThan(balloon0.rect.height * 0.5);
    await scrollToProgress(page, "heart-box", 1);
    const at100 = await sceneState(page, "heart-box");
    expect(Math.abs(translateY(at100.layers[1].transform))).toBeLessThan(1);
    // exactly one driver: the only animation on the layer is the paused scrubbed one
    expect(at100.layers[1].animations.length).toBe(1);
    await context.close();
  });
});

test.describe("no JavaScript", () => {
  test("content, scenes at rest and the FAQ are all there", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beğeni değil. İş sonucu.");
    expect(await page.locator("[data-scene]").count()).toBe(3);
    expect(await page.locator('[data-scene="heart-box"] [data-layer]').count()).toBe(3);
    expect(await page.locator("[data-enter-state]").count()).toBe(0);
    await expect(page.locator('[data-enter="sides"]').first()).toBeVisible();
    expect(await page.locator("details summary").count()).toBeGreaterThan(3);
    const stage = page.locator('[data-scene="heart-box"] .scene__stage');
    await expect(stage).toHaveAttribute("role", "img");
    await expect(stage).toHaveAttribute("aria-label", /balon/);
    await context.close();
  });
});

test.describe("layout integrity", () => {
  for (const width of [320, 390, 430, 768, 1024, 1440, 1920]) {
    test(`no page-level horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 740 : 900 });
      for (const path of ["/", "/hizmetler/strateji-ve-marka-konumlandirma", "/hizmetler/kreatif-konsept-ve-reklam-tasarimi"]) {
        await gotoAndSettle(page, path);
        for (const frac of [0, 0.3, 0.6, 0.9]) {
          await page.evaluate((f) => window.scrollTo({ top: document.documentElement.scrollHeight * f, behavior: "instant" }), frac);
          await page.waitForTimeout(80);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, `${path} at ${frac}`).toBeLessThanOrEqual(0);
        }
      }
    });
  }

  test("scenes reserve their footprint: no layout shift from the figures", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => {
      const stage = document.querySelector('[data-scene="heart-box"]')!.getBoundingClientRect();
      return { h: stage.height, docH: document.documentElement.scrollHeight };
    });
    await scrollToProgress(page, "heart-box", 0.5);
    await waitForScene(page, "heart-box");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => {
      const stage = document.querySelector('[data-scene="heart-box"]')!.getBoundingClientRect();
      return { h: stage.height, docH: document.documentElement.scrollHeight };
    });
    expect(after.h).toBeCloseTo(before.h, 0);
    expect(after.docH).toBe(before.docH);
  });

  test("navigation re-initialises cleanly without stale animations", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "heart-box", 0.5);
    await waitForScene(page, "heart-box");
    await page.getByRole("link", { name: "Hizmetler", exact: true }).first().click();
    await expect(page).toHaveURL(/\/hizmetler$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Az iş. Net iş.");
    // the previous page stays mounted but hidden (Next.js keeps it for instant back navigation): nothing of it may animate
    expect(await page.evaluate(() => Array.from(document.querySelectorAll("[data-scene]")).filter((s) => s.getClientRects().length > 0).length)).toBe(0);
    // no scene-layer animation survives the hidden page (CSS view() reveals of the new page are not scenes)
    expect(
      await page.evaluate(
        () => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target instanceof HTMLElement && ((a.effect as KeyframeEffect).target as HTMLElement).dataset.layer).length,
      ),
    ).toBe(0);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Beğeni değil. İş sonucu.");
    await scrollToProgress(page, "heart-box", 0.5);
    await waitForScene(page, "heart-box");
    const state = await sceneState(page, "heart-box");
    expect(state.layers[1].animations.length).toBe(1);
  });
});

test.describe("routes, SEO and 404", () => {
  test("routes render with one H1 and their metadata; unknown slugs 404", async ({ page, request }) => {
    for (const [path, h1] of [
      ["/", "Beğeni değil. İş sonucu."],
      ["/hizmetler/strateji-ve-marka-konumlandirma", "Herkese değil. Doğru kişiye."],
      ["/hizmetler/kreatif-konsept-ve-reklam-tasarimi", "Güzel olması yetmez."],
      ["/yaklasimimiz", "Önce soru. Sonra reklam."],
      ["/hakkimizda", "Adımız ters. İşimiz net."],
      ["/islerimiz", "Gösterişe değil. Etkiye bak."],
      ["/iletisim", "Biraz rahatsız olalım."],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical ?? "", "http://localhost").pathname).toBe(path);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /link-preview-og-image/);
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
    }
    // Unknown slugs render the 404 page. Under self-hosted `next start` the partially
    // prerendered [slug] shell is streamed with status 200 and the not-found boundary
    // (identical on `main`); on Vercel the same request answers 404. Both are accepted.
    const missing = await request.get("/hizmetler/olmayan-hizmet");
    expect([200, 404]).toContain(missing.status());
    await page.goto("/hizmetler/olmayan-hizmet");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bu sayfa ters gitti.");
    // every robots meta on the 404 page (site-level + not-found) says noindex
    const robots = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((e) => e.getAttribute("content") ?? ""));
    expect(robots.length).toBeGreaterThan(0);
    for (const content of robots) expect(content).toMatch(/noindex/);
    const notFoundRoot = await request.get("/olmayan-sayfa");
    expect(notFoundRoot.status()).toBe(404);
  });

  test("the gallery keeps its ten posters, counter and arrow keys", async ({ page }) => {
    await gotoAndSettle(page, "/");
    const track = page.getByRole("list", { name: /Kampanya afişleri/ });
    await expect(track.locator("li")).toHaveCount(10);
    await track.scrollIntoViewIfNeeded();
    await track.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('[aria-live="polite"]')).toContainText("02");
  });
});
