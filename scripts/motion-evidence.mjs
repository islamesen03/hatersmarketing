// Deterministic screenshots of every scene at progress 0 / 0.25 / 0.5 / 0.75 / 1, the owl's
// three eye states, text entrances and the reduced-motion still, across the review viewport
// matrix. Labels (route, viewport, browser, commit) go into the file names and index.json.
//
// Needs a running production server: `npm run build && npm run start -- -p 3200`
// Usage: node scripts/motion-evidence.mjs [--base http://localhost:3200] [--out docs/motion/evidence]

import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const base = arg("--base", process.env.E2E_BASE_URL ?? "http://localhost:3200");
const outDir = path.resolve(root, arg("--out", "docs/motion/evidence"));
const commit = execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim();

const viewports = {
  "desktop-1440x900": { width: 1440, height: 900 },
  "desktop-1920x1080": { width: 1920, height: 1080 },
  "short-1280x720": { width: 1280, height: 720 },
  "tablet-768x1024": { width: 768, height: 1024 },
  "mobile-390x844": { width: 390, height: 844, mobile: true },
  "mobile-320x568": { width: 320, height: 568, mobile: true },
  "mobile-430x932": { width: 430, height: 932, mobile: true },
  "landscape-844x390": { width: 844, height: 390, mobile: true },
};
const scenes = [
  { id: "heart-box", route: "/" },
  { id: "cards", route: "/" },
  { id: "owl", route: "/" },
  { id: "pawns", route: "/hizmetler/strateji-ve-marka-konumlandirma" },
  { id: "cards", route: "/hizmetler/kreatif-konsept-ve-reklam-tasarimi", key: "cards-service" },
];
const steps = [0, 0.25, 0.5, 0.75, 1];

async function scrollToProgress(page, id, p) {
  await page.evaluate(
    ([sceneId, target]) => {
      const stage = document.querySelector(`[data-scene="${sceneId}"]`);
      const header = document.querySelector("header");
      const h = header ? header.getBoundingClientRect().height : 0;
      const v = window.innerHeight - h;
      const rect = stage.getBoundingClientRect();
      const docTop = rect.top + window.scrollY;
      const centerY = h + 0.85 * v - target * 0.6 * v;
      window.scrollTo({ top: Math.round(docTop + rect.height / 2 - centerY), behavior: "instant" });
    },
    [id, p],
  );
  await page.waitForFunction(
    (sceneId) => {
      const stage = document.querySelector(`[data-scene="${sceneId}"]`);
      const imgs = Array.from(stage.querySelectorAll("img"));
      return stage.dataset.sceneState === "ready" && imgs.every((i) => i.complete && i.naturalWidth > 0);
    },
    id,
    { timeout: 15000 },
  );
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(120);
}

async function shootStage(page, id, file) {
  const clip = await page.evaluate((sceneId) => {
    const r = document.querySelector(`[data-scene="${sceneId}"]`).getBoundingClientRect();
    const pad = 24;
    return {
      x: Math.max(0, r.x - pad),
      y: Math.max(0, r.y - pad),
      width: Math.min(window.innerWidth, r.width + pad * 2),
      height: Math.min(window.innerHeight, r.height + pad * 2),
    };
  }, id);
  await page.screenshot({ path: file, clip });
}

const browser = await chromium.launch();
const index = { commit, base, browser: `chromium ${browser.version()}`, generatedAt: new Date().toISOString(), files: [] };
await mkdir(outDir, { recursive: true });

for (const [vpName, vp] of Object.entries(viewports)) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const scene of scenes) {
    const key = scene.key ?? scene.id;
    const dir = path.join(outDir, key);
    await mkdir(dir, { recursive: true });
    await page.goto(base + scene.route, { waitUntil: "load" });
    await page.waitForSelector("html[data-motion]");
    for (const p of steps) {
      await scrollToProgress(page, scene.id, p);
      const file = path.join(dir, `${vpName}-p${String(p).replace("0.", "")}.png`);
      await shootStage(page, scene.id, file);
      index.files.push({ scene: key, route: scene.route, viewport: vpName, progress: p, file: path.relative(root, file) });
    }
    if (scene.id === "owl" && scene.route === "/") {
      for (const [eye, lid] of [
        ["viewer-right-closed", "lid-viewer-right"],
        ["viewer-left-closed", "lid-viewer-left"],
      ]) {
        await scrollToProgress(page, "owl", 0.5);
        // Let any real wink (fired or queued by the stepping above) finish first.
        await page.waitForFunction(() => !document.querySelector('[data-scene="owl"]').dataset.wink, null, { timeout: 5000 });
        await page.waitForTimeout(1000);
        // Freeze the lid at its closed frame for a deterministic capture.
        await page.evaluate((layer) => {
          const el = document.querySelector(`[data-scene="owl"] [data-layer="${layer}"]`);
          const anim = el.animate(
            [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", offset: 0.35 }, { clipPath: "inset(0 0 0% 0)", offset: 0.48 }, { clipPath: "inset(0 0 100% 0)" }],
            { duration: 315, fill: "none" },
          );
          anim.pause();
          anim.currentTime = 130;
          window.__frozenLid = anim;
        }, lid);
        await page.waitForTimeout(80);
        const file = path.join(dir, `${vpName}-${eye}.png`);
        await shootStage(page, "owl", file);
        await page.evaluate(() => window.__frozenLid?.cancel());
        index.files.push({ scene: key, route: scene.route, viewport: vpName, state: eye, file: path.relative(root, file) });
      }
    }
  }
  // Text entrance: the first diagnosis headline mid-transition and settled.
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForSelector("html[data-motion]");
  const headline = page.locator('[data-enter="sides"]').first();
  await headline.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const entranceFile = path.join(outDir, "typography", `${vpName}-diagnosis-headline.png`);
  await mkdir(path.dirname(entranceFile), { recursive: true });
  await page.screenshot({ path: entranceFile });
  index.files.push({ scene: "typography", route: "/", viewport: vpName, file: path.relative(root, entranceFile) });
  // Full page at rest for layout comparison (JPEG to keep the repo light).
  const fullFile = path.join(outDir, "pages", `${vpName}-home.jpg`);
  await mkdir(path.dirname(fullFile), { recursive: true });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: fullFile, fullPage: true, type: "jpeg", quality: 72 });
  index.files.push({ scene: "page", route: "/", viewport: vpName, file: path.relative(root, fullFile) });
  await context.close();
}

// Reduced motion: the still image at mid progress, desktop and mobile.
for (const [vpName, vp] of [
  ["desktop-1440x900", viewports["desktop-1440x900"]],
  ["mobile-390x844", viewports["mobile-390x844"]],
]) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce", isMobile: Boolean(vp.mobile) });
  const page = await context.newPage();
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForSelector('html[data-motion="reduced"]');
  for (const id of ["heart-box", "cards", "owl"]) {
    await page.evaluate((sceneId) => {
      const stage = document.querySelector(`[data-scene="${sceneId}"]`);
      stage.scrollIntoView({ block: "center", behavior: "instant" });
    }, id);
    // Eyelids never load under reduced motion (they are clipped away and nothing winks).
    await page.waitForFunction(
      (sceneId) =>
        Array.from(document.querySelector(`[data-scene="${sceneId}"]`).querySelectorAll('[data-layer]:not([data-role="wink"]) img')).every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      id,
      { timeout: 15000 },
    );
    await page.waitForTimeout(150);
    const file = path.join(outDir, "reduced-motion", `${vpName}-${id}.png`);
    await mkdir(path.dirname(file), { recursive: true });
    await shootStage(page, id, file);
    index.files.push({ scene: id, route: "/", viewport: vpName, state: "reduced-motion", file: path.relative(root, file) });
  }
  await context.close();
}

await browser.close();
await writeFile(path.join(outDir, "index.json"), JSON.stringify(index, null, 2));
console.log(`${index.files.length} files written to ${path.relative(root, outDir)} (commit ${commit})`);
