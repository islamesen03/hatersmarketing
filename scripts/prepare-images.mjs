// Builds web derivatives from the agency's own reference posters (1122x1402 PNGs).
// - posters/: whole posters, used one at a time in the editorial gallery.
// - objects/: text-free crops of the single object in a poster (knot, pawns, ...).
//
// Usage (from website/):
//   node scripts/prepare-images.mjs ["<path to reference folder>"]
// Default source: ../../haters marketing  (the folder next to the brand kit on the Desktop)

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const source = path.resolve(process.argv[2] ?? path.join(root, '..', '..', 'haters marketing'));
const out = path.join(root, 'public', 'images');

const posters = [
  ['herkese-hitap-etmiyoruz', 'Herkese hitap etmeyen manifesto-1.png'],
  ['begeni-geldi-siparis', 'Beğeni var, sipariş nerede_-4.png'],
  ['rakibini-kopyaladin', 'Aynı piyonlar, farklı renk-3.png'],
  ['algoritmayi-suclamadan-once', 'Algoritmayı suçlamadan önce-7.png'],
  ['butceyi-artirdik', 'Sızan bütçe, büyüyen sorun-1.png'],
  ['her-seyi-anlattik', 'Kelimelere boğulmuş megafon-1.png'],
  ['satin-almak-istiyordum', 'Satın almayı uzatan labirent-4.png'],
  ['bu-rapor-cok-sey-sakliyor', 'Saklanan raporun kâğıt uçağı-2.png'],
  ['hemen-donuyoruz', 'Müşteri beklerken kum akıyor-2.png'],
  ['yeni-ajans-ayni-belirsizlik', 'Yeni ajans, aynı belirsizlik_-1.png'],
];

// [name, file, { left, top, width, height }, masks?] in source pixels.
// masks: rectangles (source pixels) filled with the flat background colour sampled at
// `sampleAt`, used where a fragment of the poster's own type would sit inside the crop.
const objects = [
  ['kirmizi-dugum', 'Bir yerde takılan düğüm-9.png', { left: 0, top: 600, width: 1122, height: 300 }],
  ['piyonlar', 'Aynı piyonlar, farklı renk-3.png', { left: 40, top: 535, width: 1042, height: 270 }],
  ['kalp-ve-kutu', 'Beğeni var, sipariş nerede_-4.png', { left: 468, top: 640, width: 640, height: 660 },
    [{ left: 468, top: 640, width: 222, height: 92, sampleAt: [1060, 700] }]],
  ['kartlar', 'Aynı görsel, yeni beklenti-2.png', { left: 170, top: 492, width: 860, height: 572 }],
  ['baykus-kirmizi', 'Algoritmayı suçlamadan önce-7.png', { left: 430, top: 590, width: 692, height: 715 },
    [{ left: 430, top: 775, width: 80, height: 72, sampleAt: [455, 1100] }]],
  ['defterler', 'Yeni ajans, aynı belirsizlik_-1.png', { left: 150, top: 488, width: 822, height: 497 }],
  ['kum-saati', 'Müşteri beklerken kum akıyor-2.png', { left: 592, top: 468, width: 420, height: 748 }],
  ['labirent', 'Satın almayı uzatan labirent-4.png', { left: 170, top: 560, width: 900, height: 610 }],
  ['musluk', 'Sızan bütçe, büyüyen sorun-1.png', { left: 290, top: 515, width: 700, height: 725 }],
  // Ends above the poster's question list, so the notebook bleeds off the bottom edge.
  ['defter-ve-kalem', 'Baştan konuşalım_ Meta reklam yönetimi-8.png', { left: 150, top: 405, width: 875, height: 500 },
    [
      { left: 185, top: 405, width: 60, height: 16, sampleAt: [100, 450] },
      { left: 700, top: 405, width: 60, height: 16, sampleAt: [1060, 450] },
    ]],
];

await mkdir(path.join(out, 'posters'), { recursive: true });
await mkdir(path.join(out, 'objects'), { recursive: true });

for (const [name, file] of posters) {
  const dest = path.join(out, 'posters', `${name}.jpg`);
  await sharp(path.join(source, file)).jpeg({ quality: 84, mozjpeg: true }).toFile(dest);
  console.log('poster', name);
}

async function sampleColour(input, [x, y]) {
  const { data, info } = await sharp(input)
    .extract({ left: x, top: y, width: 12, height: 12 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sum = [0, 0, 0];
  for (let i = 0; i < data.length; i += info.channels) {
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
  }
  const pixels = data.length / info.channels;
  const [r, g, b] = sum.map((v) => Math.round(v / pixels));
  return { r, g, b };
}

/**
 * Cuts a red object out of a flat cream backdrop. Alpha comes from how much redder a
 * pixel is than the backdrop; edge pixels are then "un-mixed" from the cream so the
 * cut-out sits cleanly on black without a light halo. Shadows (grey, unsaturated)
 * fall away with the backdrop.
 */
async function cutOutRed(input, box, dest, { lo = 26, hi = 66 } = {}) {
  const { data, info } = await sharp(input).extract(box).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = await sampleColour(input, [box.left + 8, box.top + 8]);
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const redness = r - (g + b) / 2 - (bg.r - (bg.g + bg.b) / 2);
    let a = Math.min(1, Math.max(0, (redness - lo) / (hi - lo)));
    a = a * a * (3 - 2 * a); // smoothstep
    if (a > 0) {
      out[o] = Math.min(255, Math.max(0, Math.round((r - (1 - a) * bg.r) / a)));
      out[o + 1] = Math.min(255, Math.max(0, Math.round((g - (1 - a) * bg.g) / a)));
      out[o + 2] = Math.min(255, Math.max(0, Math.round((b - (1 - a) * bg.b) / a)));
    }
    out[o + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 0 })
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

await cutOutRed(
  path.join(source, 'Bir yerde takılan düğüm-9.png'),
  { left: 0, top: 600, width: 1122, height: 300 },
  path.join(out, 'objects', 'kirmizi-dugum-dekupe.png'),
);
console.log('cutout kirmizi-dugum-dekupe');

for (const [name, file, box, masks = []] of objects) {
  const input = path.join(source, file);
  const dest = path.join(out, 'objects', `${name}.jpg`);
  let image = sharp(input).extract(box);
  if (masks.length) {
    const patches = [];
    for (const mask of masks) {
      const from = await sampleColour(input, mask.sampleAt);
      // With sampleEnd the patch is a vertical gradient, which hides the seam on lit backdrops.
      const to = mask.sampleEnd ? await sampleColour(input, mask.sampleEnd) : from;
      const rgb = ({ r, g, b }) => `rgb(${r},${g},${b})`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${mask.width}" height="${mask.height}">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${rgb(from)}"/><stop offset="1" stop-color="${rgb(to)}"/>
        </linearGradient></defs>
        <rect width="100%" height="100%" fill="url(#g)"/></svg>`;
      const patch = await sharp(Buffer.from(svg)).png().toBuffer();
      patches.push({ input: patch, left: mask.left - box.left, top: mask.top - box.top });
    }
    image = sharp(await image.toBuffer()).composite(patches);
  }
  await image.jpeg({ quality: 86, mozjpeg: true }).toFile(dest);
  console.log('object', name, `${box.width}x${box.height}`);
}
