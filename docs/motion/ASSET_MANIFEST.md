# Asset manifest — motion layers

Machine-readable source of truth: `assets/motion-src/manifest.json` (artboards, layer offsets, pivots, anchors, extraction notes) and the generated `src/content/motion-assets.ts`. This page explains provenance, method and known limits. Static composites for review: `docs/motion/evidence/static/<scene>-rest.png` (on the page field) and `<scene>-alpha.png` (checkerboard). Regenerate with `npm run motion:verify`.

## Provenance and limits

- The 40 original poster PNGs (1122×1402) live only on the original author's desktop (BRAND_AUDIT.md §6); they are **not** in the repository and were not available here. Every layer was therefore cut from the committed JPEG derivatives: the object crops in `public/images/objects/` (quality 86) and, for the owl, the full poster JPEG in `public/images/posters/` (quality 84), which holds more of the head than the old object crop. No screenshot was upscaled; nothing was called high-resolution source art.
- Extraction is reproducible: `scripts/motion-layers/` (Python 3.12, numpy/OpenCV/Pillow/SciPy, `rembg` segmentation models cached locally). The web build never runs it; it only consumes the exported PNGs and the manifest. See `scripts/motion-layers/README.md`.
- Masters are the exported lossless RGBA PNGs themselves (trimmed to opaque bounds with a 2 px pad, offsets recorded). `next/image` serves them as AVIF/WebP with alpha at the rendered size; the lossless files stay out of the initial payload because every scene is below the fold except the service heroes, whose layers are eager.
- Transparency was checked after optimisation through the real delivery path (`/_next/image?url=…` requests in the browser suite load every layer with `naturalWidth > 0`, and the pixel check sees the page background through the cut-outs).

## Scenes

### heart-box — artboard 640×660 (`objects/kalp-ve-kutu.jpg`)

| Layer | Trimmed size @ offset | Role | Method |
| --- | --- | --- | --- |
| `box-rear` | 617×454 @ (0,0) | static | Scene mask from `isnet-general-use`; everything above the near rim polyline L(75,330)–F(320,455)–R′(505,325) lifted 3 px. Hidden regions behind the balloon/string reconstructed: the string by exact horizontal interpolation across its 2–3 px, the heart's footprint by `cv2.inpaint` (Telea, r=9) sourced only from genuine cardboard (backdrop and foil excluded), cardboard grain re-added from shifted copies of the same surface, the standing flap's top edge redrawn along the authored polygon. |
| `balloon` | 266×443 @ (213,22) | scroll, pivot (0.3985, 0.98194) = string bottom | Red hue inside the scene mask with specular holes filled; knot included; photographed string keyed in a narrow column; outer edge anti-aliasing from the segmentation alpha, un-mixed from the cream backdrop. |
| `box-front` | 616×353 @ (0,297) | static | Near walls, near flaps and rim (box pixels on/below the lifted rim polyline). |

Anchors: `stringBottom (319,457)`, `balloonKnot (320,268)`, rim L/F/R. Known limits: the reconstructed interior behind the heart (visible only while the heart is low) is smooth cardboard with synthetic grain; at 1× it reads as the back wall and flap, at 2× the inpainted area is softer than the photographed cardboard. Exact PNG masters weigh 336 KB; estimated delivery 54 KB WebP / 37 KB AVIF at a 576 px stage, 33 / 23 KB at 390 px.

### cards — artboard 860×572 (`objects/kartlar.jpg`)

| Layer | Trimmed size @ offset | Role | Method |
| --- | --- | --- | --- |
| `stack-body` | 531×397 @ (310,0) | static | `birefnet-general-lite` mask bounded by the authored stack outline. The strip behind the red card's corner is reconstructed from the side face (inpaint + grain copy along the face). Under the top card the body carries a circle-free "second card" (circle inpainted from the surrounding paper, 4.5 % darker). |
| `top-card` | 523×239 @ (313,0) | scroll, pivot D (0.00382, 0.61925) | Top face polygon A(443,−4) B(838,100) C(712,232) D(315,148) plus ~3 px of paper edge, original pixels. |
| `red-card` | 538×341 @ (22,206) | scroll, pivot BL (0.01115, 0.58358) | Hue key inside the authored quad TL(178,212) TR(555,340) BR(455,548) BL(28,405); the two cream circles are filled as part of the card. |

Known limits: no poster-resolution source exists for this image (the crop is the only copy); the second card's paper is synthesised from the top card. 340 KB PNG; ≈28 KB WebP / 26 KB AVIF at 576 px.

### owl — artboard 792×865 (`posters/algoritmayi-suclamadan-once.jpg` crop x 330–1122, y 440–1305)

| Layer | Trimmed size @ offset | Role | Method |
| --- | --- | --- | --- |
| `owl` | 735×865 @ (57,0) | scroll | Chroma key against the brand red (redness smoothstep 40→120), spill un-mixed and residual tint pulled to grey (the print is monochrome), stray components dropped. Poster type that overlaps the crop is knocked out by connected-component rules (letters touching the top edge, the "ÖNCE." margin, "…akalım." at the edge of the facial disc); the small holes this leaves on the edge feathers are closed with feather streaks cloned from 46 px above. |
| `lid-viewer-left` | 183×131 @ (307,293) | wink | Ellipse (74×46, −9°, +8 px, 3 px feather) over the viewer-left eye centred at (398,358), textured with the cheek feathers below that eye, brow shade at the top, 3 px dark crease along the lower lid. |
| `lid-viewer-right` | 172×133 @ (620,215) | wink | Same construction over the viewer-right eye at (711,281), −13°, texture mirrored. |

Bleed edges: the right tuft, the right side and the body leave the artboard on the top-right, right and bottom; the stage keeps a red field on its right 64 % so those cuts read as the poster's frame, while the viewer-left tuft, facial disc and shoulder lean out over the page. Known limits: the lids are authored patches, not photographs of closed eyes; the eyelid crease is drawn. 1,211 KB PNG (the portrait alone is 1,122 KB lossless); estimated delivery 93 KB WebP / 70 KB AVIF at 576 px, 49 / 39 KB at 390 px.

### pawns — artboard 1042×270 (`objects/piyonlar.jpg`)

| Layer | Trimmed size @ offset | Role | Method |
| --- | --- | --- | --- |
| `pawn-1` … `pawn-5` | ≈170×250 @ x 33/183/350/518/684, y 16 | scroll | `birefnet-general-lite` cut-outs split by x band (true outlines); each carries its own grounding shadow (black, alpha from darkness against an inpainted backdrop estimate). |
| `pawn-red` | 192×250 @ (850,16) | scroll, pivot (0.49479, 0.984) = base centre | Same, red piece. |

The pawns stand on the stage's cream field (`.scene__field`), which matches the studio backdrop; black pieces need it. 187 KB PNG; ≈24 KB WebP / 16 KB AVIF at 576 px.

## Budget check (estimates from `npm run motion:verify`; browser-measured transfers are in REPORT.md)

| Scene | PNG masters | WebP @576 | AVIF @576 | WebP @390 | AVIF @390 | Budget |
| --- | --- | --- | --- | --- | --- | --- |
| heart-box | 336 KB | 54 KB | 37 KB | 33 KB | 23 KB | ≤350 KB desktop / ≤200 KB mobile |
| cards | 340 KB | 28 KB | 26 KB | 17 KB | 15 KB | same |
| owl | 1,211 KB | 93 KB | 70 KB | 49 KB | 39 KB | same |
| pawns | 187 KB | 24 KB | 16 KB | 15 KB | 11 KB | same |

Originals are untouched: `public/images/objects/*.jpg` and `public/images/posters/*.jpg` are still used by the gallery, the work page and every non-scene figure.
