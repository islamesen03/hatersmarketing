// Verifies the exported motion layers against the manifest and reports their weight.
// - every layer file exists, has an alpha channel and the manifest's dimensions
// - composes each scene at rest (all layers at their offsets) for review
// - estimates transferred bytes at the stage's typical rendered width in WebP/AVIF,
//   which is what next/image serves (lossless PNG masters stay in the repo)
//
// Usage: node scripts/verify-motion-assets.mjs [--out docs/motion/evidence/static]

import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outArg = process.argv.indexOf("--out");
const outDir = path.resolve(root, outArg > -1 ? process.argv[outArg + 1] : "docs/motion/evidence/static");
await mkdir(outDir, { recursive: true });

const manifest = JSON.parse(await readFile(path.join(root, "assets/motion-src/manifest.json"), "utf8"));
const fields = { "heart-box": null, cards: null, owl: [231, 67, 45], pawns: [241, 237, 228] };
// Rendered stage widths to estimate delivery: desktop 40vw of 1440 (576px) and mobile 100vw of 390.
const renderWidths = { desktop: 576, mobile: 390 };

const rows = [];
let failures = 0;
for (const scene of manifest.scenes) {
  const { width: W, height: H } = scene.artboard;
  const composites = [];
  const lidComposites = [];
  let pngBytes = 0;
  const est = { desktop: { webp: 0, avif: 0 }, mobile: { webp: 0, avif: 0 } };
  for (const layer of scene.layers) {
    const file = path.join(root, "public", layer.file);
    const info = await stat(file).catch(() => null);
    if (!info) {
      console.error(`MISSING ${layer.file}`);
      failures += 1;
      continue;
    }
    pngBytes += info.size;
    const meta = await sharp(file).metadata();
    if (!meta.hasAlpha) {
      console.error(`NO ALPHA ${layer.file}`);
      failures += 1;
    }
    if (meta.width !== layer.width || meta.height !== layer.height) {
      console.error(`SIZE MISMATCH ${layer.file}: file ${meta.width}x${meta.height}, manifest ${layer.width}x${layer.height}`);
      failures += 1;
    }
    const { data, info: raw } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparent = 0;
    let partial = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent += 1;
      else if (data[i] < 255) partial += 1;
    }
    const px = raw.width * raw.height;
    // eyelids are hidden at rest; they get their own review composite below
    if (layer.role !== "wink") composites.push({ input: file, left: layer.x, top: layer.y });
    else lidComposites.push({ input: file, left: layer.x, top: layer.y });
    for (const [name, stageWidth] of Object.entries(renderWidths)) {
      const w = Math.max(1, Math.round((layer.width / W) * stageWidth));
      const base = sharp(file).resize({ width: w });
      est[name].webp += (await base.clone().webp({ quality: 75 }).toBuffer()).length;
      est[name].avif += (await base.clone().avif({ quality: 60 }).toBuffer()).length;
    }
    rows.push({
      scene: scene.id,
      layer: layer.name,
      size: `${layer.width}x${layer.height}`,
      offset: `${layer.x},${layer.y}`,
      pngKB: (info.size / 1024).toFixed(0),
      transparent: `${((transparent / px) * 100).toFixed(0)}%`,
      softEdge: `${((partial / px) * 100).toFixed(1)}%`,
    });
  }
  const bg = fields[scene.id];
  // the page field: black, cream (pawns) or the owl's red field on the right 64%
  const fieldSvg =
    scene.id === "owl"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#0c0c0c"/><rect x="${Math.round(W * 0.36)}" y="0" width="${W - Math.round(W * 0.36)}" height="${H}" fill="#e8432d"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${bg ? `rgb(${bg.join(",")})` : "#0c0c0c"}"/></svg>`;
  const composed = sharp(Buffer.from(fieldSvg)).composite(composites);
  await composed.clone().png().toFile(path.join(outDir, `${scene.id}-rest.png`));
  if (lidComposites.length) {
    await sharp(Buffer.from(fieldSvg)).composite([...composites, ...lidComposites]).png().toFile(path.join(outDir, `${scene.id}-lids-closed.png`));
  }
  // a checkerboard version shows the true alpha
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#cfcfcf"/><rect x="16" y="16" width="16" height="16" fill="#cfcfcf"/><rect x="16" width="16" height="16" fill="#8f8f8f"/><rect y="16" width="16" height="16" fill="#8f8f8f"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`,
  );
  await sharp(tile).composite(composites).png().toFile(path.join(outDir, `${scene.id}-alpha.png`));
  rows.push({
    scene: scene.id,
    layer: "TOTAL",
    size: `${W}x${H}`,
    offset: "",
    pngKB: (pngBytes / 1024).toFixed(0),
    transparent: `webp ${(est.desktop.webp / 1024).toFixed(0)}KB / avif ${(est.desktop.avif / 1024).toFixed(0)}KB @576`,
    softEdge: `webp ${(est.mobile.webp / 1024).toFixed(0)}KB / avif ${(est.mobile.avif / 1024).toFixed(0)}KB @390`,
  });
}

console.table(rows);
await writeFile(path.join(outDir, "verify-report.json"), JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
if (failures) {
  console.error(`${failures} problem(s) found`);
  process.exit(1);
}
console.log(`ok: composites written to ${path.relative(root, outDir)}`);
