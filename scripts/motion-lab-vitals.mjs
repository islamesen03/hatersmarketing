// Throttled lab web vitals for a before/after comparison of two running builds.
// Playwright Chromium, 390x844 @2x mobile emulation, CDP 4x CPU throttle and a 400 ms RTT /
// 400 kbps network, one cold context per run. LCP and CLS are read before any scrolling
// (programmatic scrolls do not stop LCP reporting); CLS and long tasks are also collected
// over a full scroll so scene-caused shifts would show up. Medians over N runs.
//
// Usage: node scripts/motion-lab-vitals.mjs --baseline http://localhost:3300 --branch http://localhost:3200 [--runs 3] [--url /] [--rtt 400] [--kbps 400] [--cpu 4] [--out docs/motion/evidence/lab-vitals.json]
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const runs = Number(arg("--runs", 3));
const rtt = Number(arg("--rtt", 400));
const kbps = Number(arg("--kbps", 400));
const cpu = Number(arg("--cpu", 4));
const builds = { baseline: arg("--baseline", "http://localhost:3300"), branch: arg("--branch", "http://localhost:3200") };
const out = arg("--out", "docs/motion/evidence/lab-vitals.json");
const urls = arg("--url", "") ? [arg("--url", "")] : ["/", "/hizmetler/strateji-ve-marka-konumlandirma", "/hizmetler/kreatif-konsept-ve-reklam-tasarimi"];
const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

const browser = await chromium.launch();
const results = {};
for (const [name, base] of Object.entries(builds)) {
  results[name] = {};
  for (const u of urls) {
    const samples = [];
    for (let i = 0; i < runs; i += 1) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: rtt, downloadThroughput: (kbps * 1024) / 8, uploadThroughput: (kbps * 1024) / 8 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      await page.addInitScript(() => {
        window.__lab = { lcp: 0, cls: 0, longTasks: 0, lcpEl: "" };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__lab.lcp = e.startTime;
            window.__lab.lcpEl = e.element ? e.element.tagName + (e.element.className ? "." + String(e.element.className).slice(0, 30) : "") : "";
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__lab.cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) window.__lab.longTasks += Math.max(0, e.duration - 50);
        }).observe({ type: "longtask", buffered: true });
      });
      await page.goto(base + u, { waitUntil: "load" });
      await page.waitForTimeout(4000);
      const beforeScroll = await page.evaluate(() => ({ lcp: window.__lab.lcp, lcpEl: window.__lab.lcpEl, cls: window.__lab.cls }));
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 300) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 100));
        }
      });
      await page.waitForTimeout(1500);
      const lab = await page.evaluate(() => window.__lab);
      const load = await page.evaluate(() => performance.getEntriesByType("navigation")[0].loadEventEnd);
      samples.push({ lcp: Math.round(beforeScroll.lcp), lcpEl: beforeScroll.lcpEl, clsBeforeScroll: +beforeScroll.cls.toFixed(4), clsAfterScroll: +lab.cls.toFixed(4), longTaskMs: Math.round(lab.longTasks), loadMs: Math.round(load) });
      await context.close();
    }
    results[name][u] = {
      samples,
      median: {
        lcpMs: Math.round(median(samples.map((s) => s.lcp))),
        clsBeforeScroll: +median(samples.map((s) => s.clsBeforeScroll)).toFixed(4),
        clsAfterScroll: +median(samples.map((s) => s.clsAfterScroll)).toFixed(4),
        longTaskMs: Math.round(median(samples.map((s) => s.longTaskMs))),
        loadMs: Math.round(median(samples.map((s) => s.loadMs))),
        lcpEl: samples[0].lcpEl,
      },
    };
    console.log(name, u, JSON.stringify(results[name][u].median));
  }
}
await browser.close();
writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), runs, builds, conditions: `Playwright Chromium, 390x844 @2x mobile emulation, CDP ${cpu}x CPU throttle, ${rtt}ms RTT / ${kbps}kbps, cold context per run; LCP/CLS read at load+4s before scrolling, CLS/long tasks also over a full scroll`, results }, null, 2));
console.log(`written ${out}`);
