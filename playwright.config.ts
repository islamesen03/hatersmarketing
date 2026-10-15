import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the scroll scenes and text entrances (e2e/).
 * Run against a production build: `npm run build` first, then `npm run test:e2e`.
 * The config starts `next start` on port 3200 (or reuses a server already there).
 */
const port = Number(process.env.E2E_PORT ?? 3200);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  timeout: 45_000,
  expect: { timeout: 8_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "off",
    screenshot: "only-on-failure",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "short-desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "mobile-small-chromium", use: { ...devices["Pixel 7"], viewport: { width: 320, height: 568 } } },
  ],
});
