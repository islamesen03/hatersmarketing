// Network budget check for two running builds: JavaScript fetched on initial load (gzip of
// each /_next/static script body) and image bytes per scene after scrolling the whole page
// (/_next/image responses grouped by motion scene), at a desktop and a mobile width.
//
// Usage: node scripts/motion-network-budget.mjs --baseline http://localhost:3300 --branch http://localhost:3200 [--out docs/motion/evidence/network-budget.json]
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const builds = { baseline: arg("--baseline", "http://localhost:3300"), branch: arg("--branch", "http://localhost:3200") };
const out = arg("--out", "docs/motion/evidence/network-budget.json");
const urls = ["/", "/hizmetler/strateji-ve-marka-konumlandirma", "/hizmetler/kreatif-konsept-ve-reklam-tasarimi"];
const result = { generatedAt: new Date().toISOString(), builds, js: {}, images: {} };

const browser = await chromium.launch();
for (const [name, base] of Object.entries(builds)) {
  result.js[name] = {};
  for (const u of urls) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const scripts = [];
    page.on("response", async (res) => {
      const url = res.url();
      if (!url.includes("/_next/") || !(url.endsWith(".js") || url.includes(".js?"))) return;
      try {
        const body = await res.body();
        scripts.push({ url: url.split("/_next/")[1], raw: body.length, gz: gzipSync(body).length });
      } catch {}
    });
    await page.goto(base + u, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    result.js[name][u] = {
      files: scripts.length,
      rawKB: +(scripts.reduce((a, s) => a + s.raw, 0) / 1024).toFixed(1),
      gzipKB: +(scripts.reduce((a, s) => a + s.gz, 0) / 1024).toFixed(1),
      chunks: scripts.map((s) => `${s.url} ${(s.gz / 1024).toFixed(1)}KB`),
    };
    await ctx.close();
  }
  result.images[name] = {};
  for (const [vp, size, mobile] of [["desktop-1440", { width: 1440, height: 900 }, false], ["mobile-390", { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport: size, isMobile: mobile, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const transfers = [];
    page.on("response", async (res) => {
      const u = res.url();
      if (!/\/_next\/image|\/images\//.test(u)) return;
      try {
        const buf = await res.body();
        transfers.push({ url: u, bytes: buf.length, type: res.headers()["content-type"] ?? "" });
      } catch {}
    });
    for (const u of urls) {
      await page.goto(base + u, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += 400) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((r) => setTimeout(r, 120));
        }
      });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
    }
    const perScene = {};
    for (const t of transfers) {
      const m = t.url.match(/images%2Fmotion%2F([a-z-]+)%2F|images\/motion\/([a-z-]+)\//);
      const key = m ? `motion:${m[1] ?? m[2]}` : t.url.includes("objects") ? "objects" : t.url.includes("posters") ? "posters" : "other";
      perScene[key] = (perScene[key] ?? 0) + t.bytes;
    }
    result.images[name][vp] = { kb: Object.fromEntries(Object.entries(perScene).map(([k, v]) => [k, +(v / 1024).toFixed(1)])), types: [...new Set(transfers.map((t) => t.type))].join(", ") };
    await ctx.close();
  }
}
await browser.close();
writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.js, null, 1));
console.log(JSON.stringify(result.images, null, 1));
console.log(`written ${out}`);
