// Re-encodes evidence captures so the repository stays light: PNG stage captures larger
// than 200 KB become WebP (quality 90); JPEG full pages are left alone; index.json paths
// are rewritten. Usage: node scripts/motion-evidence-compress.mjs [docs/motion/evidence] [thresholdKB=200]
import sharp from "sharp";
import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidence = path.resolve(root, process.argv[2] ?? "docs/motion/evidence");
const thresholdKB = Number(process.argv[3] ?? 200);
let before = 0;
let after = 0;
const renamed = new Map();

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(p);
      continue;
    }
    if (!entry.name.endsWith(".png")) continue;
    const size = (await stat(p)).size;
    before += size;
    if (size <= thresholdKB * 1024) {
      after += size;
      continue;
    }
    const target = p.replace(/\.png$/, ".webp");
    await sharp(p).webp({ quality: 90, effort: 5 }).toFile(target);
    after += (await stat(target)).size;
    await unlink(p);
    renamed.set(path.relative(root, p).replace(/\\/g, "/"), path.relative(root, target).replace(/\\/g, "/"));
  }
}

await walk(evidence);
for (const indexFile of ["index.json", "baseline/index.json"]) {
  const file = path.join(evidence, indexFile);
  try {
    let text = await readFile(file, "utf8");
    for (const [from, to] of renamed) {
      text = text.split(from).join(to);
      text = text.split(from.replace(/\//g, "\\\\")).join(to.replace(/\//g, "\\\\"));
    }
    await writeFile(file, text);
  } catch {
    /* no index here */
  }
}
console.log(`evidence: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB, ${renamed.size} files re-encoded`);
