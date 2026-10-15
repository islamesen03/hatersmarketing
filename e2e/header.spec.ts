import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const serviceHrefs = [
  "/hizmetler/strateji-ve-marka-konumlandirma",
  "/hizmetler/kreatif-konsept-ve-reklam-tasarimi",
  "/hizmetler/meta-reklam-yonetimi",
  "/hizmetler/performans-analizi-ve-donusum-optimizasyonu",
  "/hizmetler/e-ticaret-buyume-danismanligi",
];

/** The desktop nav shows from Tailwind's `lg` (64 rem = 1024 px). */
function isDesktop(page: import("@playwright/test").Page) {
  return (page.viewportSize()?.width ?? 1440) >= 1024;
}

test.describe("header: services disclosure (desktop)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!isDesktop(page), "desktop navigation only");
    await page.goto("/");
  });

  test("opens on click, lists the five services in order, closes on Escape and returns focus", async ({ page }) => {
    const button = page.getByRole("button", { name: "Hizmet menüsünü aç" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    const panelId = await button.getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeHidden();

    await button.click();
    await expect(page.getByRole("button", { name: "Hizmet menüsünü kapat" })).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    const links = panel.getByRole("link");
    await expect(links).toHaveCount(serviceHrefs.length + 1);
    for (let i = 0; i < serviceHrefs.length; i += 1) {
      await expect(links.nth(i)).toHaveAttribute("href", serviceHrefs[i]);
    }
    await expect(links.nth(serviceHrefs.length)).toHaveAttribute("href", "/hizmetler");
    await expect(links.first()).toContainText("Strateji ve Marka Konumlandırma");

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.getByRole("button", { name: "Hizmet menüsünü aç" })).toBeFocused();
  });

  test("opens on hover and closes when the pointer leaves or the page is pressed elsewhere", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "hover emulation is unreliable in headless WebKit; covered by click and keyboard");
    const item = page.locator('nav[aria-label="Ana menü"]').getByRole("link", { name: "Hizmetler", exact: true });
    const panelId = await page.getByRole("button", { name: "Hizmet menüsünü aç" }).getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    await item.hover();
    await expect(panel).toBeVisible();
    // move into the panel through the gap: stays open
    const box = await panel.boundingBox();
    await page.mouse.move(box!.x + 40, box!.y + 30);
    await page.waitForTimeout(250);
    await expect(panel).toBeVisible();
    // leave: closes after the grace period
    await page.mouse.move(box!.x + 40, box!.y + box!.height + 120);
    await expect(panel).toBeHidden();
    // click open, then press elsewhere
    await page.getByRole("button", { name: "Hizmet menüsünü aç" }).click();
    await expect(panel).toBeVisible();
    await page.mouse.click(20, 400);
    await expect(panel).toBeHidden();
  });

  test("is fully keyboard operable and closes when focus leaves it", async ({ page, browserName }) => {
    const nav = page.locator('nav[aria-label="Ana menü"]');
    const button = page.getByRole("button", { name: "Hizmet menüsünü aç" });
    await button.focus();
    await page.keyboard.press("Enter");
    const panelId = await page.getByRole("button", { name: "Hizmet menüsünü kapat" }).getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeVisible();
    const links = panel.getByRole("link");
    if (browserName === "webkit") {
      // WebKit only tabs to links with Safari's "Press Tab to highlight each item" on, so
      // move focus programmatically and check the same focus-leaves-closes rule.
      await links.first().focus();
      await expect(links.first()).toBeFocused();
      await expect(panel).toBeVisible();
      await links.last().focus();
      await expect(links.last()).toBeFocused();
      await nav.getByRole("link", { name: "Yaklaşımımız" }).focus();
    } else {
      await page.keyboard.press("Tab");
      await expect(links.first()).toBeFocused();
      for (let i = 0; i < serviceHrefs.length; i += 1) await page.keyboard.press("Tab");
      await expect(links.last()).toBeFocused();
      await page.keyboard.press("Tab");
    }
    await expect(panel).toBeHidden();
    await expect(nav.getByRole("link", { name: "Yaklaşımımız" })).toBeFocused();
  });

  test("navigating to a service closes the panel and marks Hizmetler current", async ({ page }) => {
    await page.getByRole("button", { name: "Hizmet menüsünü aç" }).click();
    await page.getByRole("link", { name: /Meta Reklam Yönetimi/ }).first().click();
    await expect(page).toHaveURL(/\/hizmetler\/meta-reklam-yonetimi$/);
    await expect(page.getByRole("button", { name: "Hizmet menüsünü aç" })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator('nav[aria-label="Ana menü"]').getByRole("link", { name: "Hizmetler", exact: true })).toHaveAttribute("aria-current", "page");
    // the current service is marked inside the panel
    await page.getByRole("button", { name: "Hizmet menüsünü aç" }).click();
    await expect(page.getByRole("link", { name: /Meta Reklam Yönetimi/, exact: false }).first()).toHaveAttribute("aria-current", "page");
  });

  test("the open disclosure has no serious accessibility findings", async ({ page }) => {
    await page.getByRole("button", { name: "Hizmet menüsünü aç" }).click();
    const results = await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});

test.describe("header: services inside the mobile menu", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(isDesktop(page), "mobile menu only");
    await page.goto("/");
  });

  test("lists the five services under Hizmetler and closes after choosing one", async ({ page }) => {
    await page.getByRole("button", { name: "Menü" }).click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    const services = menu.getByRole("list", { name: "Hizmetler" }).getByRole("link");
    await expect(services).toHaveCount(serviceHrefs.length);
    for (let i = 0; i < serviceHrefs.length; i += 1) {
      await expect(services.nth(i)).toHaveAttribute("href", serviceHrefs[i]);
      const box = await services.nth(i).boundingBox();
      expect(box!.height, "touch target").toBeGreaterThanOrEqual(44);
    }
    await services.nth(1).click();
    await expect(page).toHaveURL(/\/hizmetler\/kreatif-konsept-ve-reklam-tasarimi$/);
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: "Menü" }).click();
    await expect(menu.getByRole("list", { name: "Hizmetler" }).getByRole("link").nth(1)).toHaveAttribute("aria-current", "page");
  });
});
