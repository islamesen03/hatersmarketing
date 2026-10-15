# UX motion upgrade — delivery report

Branch `feat/ux-motion-upgrade` on top of `main` @ `2102905` (13 Oct 2026, identical to the live site's markers on 15 Oct 2026). Prepared 15 Oct 2026. Nothing has been deployed, merged, or submitted to production forms.

Companion documents: [MOTION_SPEC.md](MOTION_SPEC.md) (choreography, drivers, tokens, failure matrix) · [ASSET_MANIFEST.md](ASSET_MANIFEST.md) (layers, provenance, sizes) · `docs/motion/evidence/` (screenshots, baseline captures, static composites, index.json files with route/viewport/browser/commit labels).

## 1. What changed and why

Four photographed objects now participate in the argument as the visitor scrolls, and selected headlines arrive from opposed directions, without touching copy, type, palette, grid, section order, URLs, navigation, forms, consent or analytics.

| Area | Change |
| --- | --- |
| Diagnosis 01 (home) | The foil heart rises out of the open box as the row enters; the box and its near walls stay put, the string stays attached and passes behind the rim. Figure field removed (true cut-outs on the black section). |
| Diagnosis 02 (home) and creative service hero | The red card is dealt out from under the stack along its own axis; the top card fans a degree. |
| Diagnosis 03 (home) | The owl winks viewer-right at p ≈ 0.30 and viewer-left at p ≈ 0.68, with textured eyelids, a robust state machine, and a red brand field it leans out of. |
| Strategy service hero | Five black pawns align with a short stagger; the red pawn steps forward and grows ≤ 1.035, on the studio's cream field. |
| Typography | `Headline enter="sides"` (diagnosis titles, closing CTAs, the service-page "Dinle. Sorgula. / Sonra yap." — the R1 reference realised with the existing content); `data-enter="left"` on section titles across home, services, approach, about, work. Contact and legal pages unchanged. |
| Lists | Services rows and method steps stagger on the existing `[data-reveal]` timeline; method rules draw in where `view()` timelines exist. |
| Hero, manifesto, FAQ, forms | Unchanged (the knot signature, the inversion, `<details>` FAQ, lead form, consent and analytics are as before). |
| Campaign gallery (home) | Left untouched by the motion work; removed afterwards on the client's request (the posters remain on `/islerimiz`). The homepage order is now hero → manifesto → diagnoses → services → method → sample deliverables → FAQ → closing CTA. |

Design decisions worth knowing: scene identity is explicit content (`Picture.scene`), not derived from headings or order; every scene renders the still image on the server and only gains animation objects on the client; one driver per scene (native `ViewTimeline` or the shared scroll driver), one keyframe definition per scene; nothing is pinned.

## 2. File and change map

New:

- `src/lib/motion/` — `progress.ts` (progress definition + timeline insets), `capabilities.ts`, `preferences.ts`, `choreography.ts` (keyframes, wink timings), `wink-machine.ts` (pure state machine), `scene-controller.ts` (scenes, entrances, drivers, lifecycle), `scroll-timelines.d.ts` (DOM typings TypeScript 5.9 lacks).
- `src/components/motion/SceneFigure.tsx` (server: stage + layers, plain-image fallback) and `MotionBoundary.tsx` (the only client boundary; wraps page content and scopes enhancement to that page).
- `src/content/motion-assets.ts` (generated manifest), `assets/motion-src/manifest.json`, `public/images/motion/<scene>/*.png` (15 layers).
- `scripts/motion-layers/` (Python extraction pipeline + README), `scripts/verify-motion-assets.mjs` (alpha/size/weight check + static composites), `scripts/motion-evidence.mjs` (screenshot matrix), `scripts/motion-evidence-compress.mjs`, `scripts/motion-network-budget.mjs` and `scripts/motion-lab-vitals.mjs` (the measurements in §5).
- `tests/motion.test.mts` (wink machine + progress unit tests), `e2e/*.spec.ts` + `playwright.config.ts` (browser suite), `docs/motion/*`.

Modified:

- `src/content/types.ts` (`SceneId`, `Picture.scene`), `src/content/images.ts` (four scene ids).
- `src/components/Headline.tsx` (`enter` variant; `reveal` API unchanged), `PageHero.tsx` (scene-capable figure), `home/Diagnoses.tsx` (scene figures, directional titles), `CTASection.tsx`, `ProcessSteps.tsx` (stagger + rule), `ServicesList.tsx` (stagger), `home/GallerySection.tsx`, `home/ProcessDemo.tsx` (title entrance).
- `src/app/page.tsx`, `hizmetler/page.tsx`, `hizmetler/[slug]/page.tsx`, `yaklasimimiz/page.tsx`, `hakkimizda/page.tsx`, `islerimiz/page.tsx` (wrapped in `MotionBoundary`; the service process title uses `Headline`).
- `src/app/globals.css` (entrances, rule draw, scene stage/layers; `[data-reveal]` gains a `--i` stagger with the same default range).
- `package.json` / `package-lock.json` (scripts and dev dependencies below).

No source files were deleted; no framework dependency was upgraded.

## 3. Dependencies added (dev only)

| Package | Version | Why |
| --- | --- | --- |
| `@playwright/test` | 1.64.1 | Browser suite (`npm run test:e2e`) and the evidence capture script. |
| `@axe-core/playwright` | 4.13.0 | Automated accessibility scan of the touched routes. |
| `sharp` | 0.35.5 (already installed transitively by Next) | Declared explicitly because `scripts/verify-motion-assets.mjs` and the e2e pixel check import it. |

Runtime dependencies are unchanged: no animation library, no smooth-scroll library. The offline asset pipeline uses a separate Python environment (`scripts/motion-layers/README.md`), never the web build.

## 4. Test results

Commands and status (15 Oct 2026, Windows 11, Node 24.18, npm 12.1):

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass (after a build; before any build it fails on the generated `next-env.d.ts` exactly as on `main`) |
| `npm test` | 16 / 16 pass (7 existing lead-validation tests + 9 motion unit tests) |
| `npm run build` | pass, same route table as `main` |
| `npm run test:e2e` | 204 / 204 pass (4 Chromium + 2 WebKit projects × 34 tests), see §4.1 |

### 4.1 Browser suite

`npm run build && npm run test:e2e` — Playwright 1.64.1, six projects, 34 tests each (204 in total): Chromium 1248 at desktop 1440×900, short desktop 1280×720, mobile 390×844 (Pixel 7 emulation, touch) and small mobile 320×568; WebKit 2370 (Safari 27-class) at desktop 1440×900 and as iPhone 14 (390×664, touch, 3×). A Firefox project exists behind `E2E_FIREFOX=1` (see the engine table and §7).

Engine coverage and the driver each engine takes (`html[data-motion]`, `data-scene-driver`):

| Engine (Playwright build) | `ViewTimeline` | `animation-timeline: view()` | Driver used by the scenes | Result |
| --- | --- | --- | --- | --- |
| Chromium 1248 | yes | yes | native ViewTimeline (timeline `currentTime` matches `p` to 0.1 %) | 136 / 136 |
| WebKit 2370 (desktop + iPhone 14) | yes | yes | native ViewTimeline (verified: `ViewTimeline:running:56.7 %` at `p = 0.568`) | 68 / 68 |
| Chromium with `ViewTimeline` deleted (fallback test) | no | yes | shared scroll driver, paused DocumentTimeline animations scrubbed by `p` | pass |
| Firefox 1555 | — | — | — | not runnable here: the Playwright build fails to start on this Windows 11 machine with a side-by-side error ("dependent assembly mozglue 1.0.0.0 not found", Application log event 33), reproduced after `playwright install --force firefox`; the project is opt-in via `E2E_FIREFOX=1` for a machine or CI runner where the build starts |

Engine differences surfaced by the WebKit run were all in the tests, not in the motion code: WebKit only moves keyboard focus to links when Safari's "Press Tab to highlight each item" preference is on (the keyboard test now checks DOM order + `focus()` there), mobile WebKit has no mouse wheel (`scrollBy` instead), the opacity transition (420 ms) finishes before the transform one (760 ms) so the entrance test polls both, and the pixel sampler now reads the channel count and scale factor of whatever screenshot the engine returns.

| Spec | What it proves |
| --- | --- |
| `scenes.spec.ts` | Heart: balloon rises independently (translateY decreases monotonically with `p`), box layers never transform, stage size constant, string bottom lands on the near corner F within 2.5 px at `p = 1`, reverse and jumps follow progress; a pixel check reads cardboard grey on the near wall and foil red on the lobe top at `p = 0.15` (occlusion is real, not just numbers). Cards: tucked → dealt, top card fans, stack static. Pawns: six true outlines, red pawn lifts 4–11 % of its height with scale ≤ 1.04, row holds. All layer images load with `naturalWidth > 0` through `/_next/image`. |
| `owl.spec.ts` | Viewer-right then viewer-left on a forward pass; at most one lid animates at a time; cooldown respected on a fast pass (queued wink plays after it); jitter around a threshold does not retrigger; reverse traversal stays open; leaving and returning replays right then left; arriving mid-scene (reload at a saved offset) fires nothing retroactively; a runtime switch to reduced motion cancels the wink and leaves both lids hidden with zero animations in the document. |
| `robustness.spec.ts` | Text entrances: armed below the fold, released on intersection from both directions, final opacity 1 and no transform, accessible text "Beğeni geldi. Sipariş?" intact, no re-hide on reversal; block titles once from the left. Reduced motion at load: `data-motion="reduced"`, no animation objects, no transforms, lids hidden, `scroll-behavior: auto`. Runtime preference change both ways. Fallback driver with `ViewTimeline` deleted: `data-motion="fallback"`, one paused DocumentTimeline animation per layer scrubbed by progress (exactly one driver). No JavaScript: H1, three scenes with their layers, FAQ `<details>`, visible headline, `role="img"` + Turkish description. No page-level horizontal overflow at 320/390/430/768/1024/1440/1920 on three routes at four scroll positions. No layout shift from the figures. Client navigation and back: no scene animation survives the hidden previous page; re-initialisation creates exactly one animation per scrolled layer. Routes render one visible H1 with canonical, OG image and JSON-LD; the 404 page renders with `noindex` for an unknown slug; the gallery keeps ten posters, its counter and arrow keys. |
| `a11y.spec.ts` | axe-core 4.13 (WCAG 2.0/2.1 A+AA + best practice) on `/`, both scene service pages and `/yaklasimimiz`, twice each: with reduced motion (every element at its final pose) and with motion on at the top of the page after the load reveals; zero serious/critical findings. Keyboard: skip link first, nothing focusable inside a scene, every layer `pointer-events: none`. |

Final run (15 Oct 2026, after the last code change): **204 passed, 0 failed, 0 flaky (5.8 min)**. One baseline finding is excluded from the enhanced-state scan and reported in §6: the manifesto's inverted first line (`[data-upright]`, unchanged from `main`) rests at opacity 0.35 while still below the fold, which axe reads as a contrast failure of an offscreen pose.

### 4.2 Manual checks

Reviewed on the captured evidence (`docs/motion/evidence/`, Chromium 1248 via Playwright; `index.json` records the parent commit `2102905` because the captures were taken from the final working tree immediately before it was committed — regenerate with `npm run motion:evidence` against a production server to label a later commit) and in the extraction review sheets:

- Heart & box at p 0 / 0.25 / 0.5 / 0.75 / 1 on 1440×900, 1920×1080, 1280×720, 768×1024, 390×844, 320×568, 430×932 and 844×390: the heart starts mostly below the near rim with only the lobe tops showing through the opening, rises through it, clears the rim with a small sway and settles at the photographed pose; the box never moves; the string stays attached; no second heart or backdrop remnant; no collision with copy.
- Owl: the viewer-right and viewer-left lids read as closed eyes at 1× (the texture is the facial-disc feathers with a drawn crease); the red field and the leaning silhouette hold at every width; both eyes are open at rest.
- Cards: the tucked card (−5°, along its own axis) covers more of the stack, so no missing pixels show; the dealt pose equals the photo; the top-card fan is ≈1° and reads as depth, not as a second animation.
- Pawns: six true outlines with their own shadows on the cream field; the red pawn's step is visible but restrained (−6 % height, ×1.035).
- Typography: "BEĞENİ GELDİ." arrives from the left and "SİPARİŞ?" from the right out of their clips, dots and cedillas intact (`typography/*-diagnosis-headline.*`); section titles slide in once from the left; reversing after reading does not hide them.
- Reduced motion (`reduced-motion/*`): the still image, lids hidden, no armed text.
- Resting layouts compared with the baseline captures (`baseline/*`, live site 15 Oct 2026): section order, type, copy, grid and colours are unchanged; the only differences are the three diagnosis figures (cut-outs instead of cream/red photo fields) and the owl's inset red field.
- Keyboard: skip link → header CTA → nav; nothing inside a scene is focusable; layers are `pointer-events: none` (automated in `a11y.spec.ts`). Screen-reader spot check (NVDA was not available in this environment): the accessibility tree exposes one image per scene with the Turkish alt text and plain headings with full text — verified with Playwright's `getByRole` queries; a real screen-reader pass is still recommended before launch.
- Real iOS Safari / Android Chrome were not available: everything above is Chromium and WebKit (headless, with Playwright's mobile emulation). Firefox is a listed next action (see §4.1 and §7).

## 5. Performance

Conditions: both builds served locally with `next start` on this machine (baseline = `main` @ 2102905 in a separate worktree with its own `npm ci`, port 3300; branch on port 3200), Chromium 1248 (Playwright), no CDN, Next's default gzip. Measured with `scratchpad/perf-compare.mjs` (network capture) — numbers are lab measurements, not field data, and not production numbers.

### 5.1 JavaScript fetched on initial load (all `/_next/static/*.js`, gzip of the body)

| Route | Baseline | Branch | Δ |
| --- | --- | --- | --- |
| `/` | 151.1 KB (8 files) | 158.9 KB (9 files) | **+7.8 KB** |
| `/hizmetler/strateji-ve-marka-konumlandirma` | 151.3 KB (9 files) | 163.1 KB (10 files) | **+11.8 KB** |
| `/hizmetler/kreatif-konsept-ve-reklam-tasarimi` | 151.3 KB (9 files) | 163.1 KB (10 files) | **+11.8 KB** |

Within the ≤30 KB gzip target for the native/shared-controller approach; no animation library was added.

### 5.2 Image bytes per scene as delivered (`/_next/image`, AVIF, whole page scrolled)

| Scene | Desktop 1440 (AVIF) | Mobile 390 (AVIF) | Budget |
| --- | --- | --- | --- |
| heart-box (3 layers) | 26.1 KB | 20.3 KB | ≤350 / ≤200 KB |
| cards (3 layers; home + creative hero, both sizes) | 43.0 KB | 26.8 KB | same |
| owl (3 layers) | 58.7 KB | 26.5 KB | same |
| pawns (6 layers) | 17.5 KB | 12.9 KB | same |

For comparison the baseline's flattened object photos for the same figures weighed 99.1 KB desktop / 92.1 KB mobile (AVIF). Scene layers are lazy except the two service heroes (eager, above the fold, 17.5 KB and ≈21 KB); the home page's initial viewport fetches no scene layer, so the added initial-viewport transfer attributable to the upgrade is 0 KB of images and 7.8 KB of script.

### 5.3 Throttled lab vitals (Lighthouse could not run here)

Lighthouse 12 was installed but could not launch Chromium in this sandboxed shell (`chrome-launcher` fails with `spawn UNKNOWN` for both Playwright's Chromium and a forward-slash `CHROME_PATH`; attaching to a Playwright-launched Chromium via `--port` hung). Rather than report scores that were not produced, the before/after comparison below uses the same Chromium with CDP throttling on a 390×844 @2× mobile emulation, a cold context per run, three runs, median — the Web-Vitals APIs (`largest-contentful-paint`, `layout-shift`, `longtask`) read in-page at load + 4 s before any scrolling, then CLS and long tasks again after a full scroll (`scripts/motion-lab-vitals.mjs`; raw samples in `docs/motion/evidence/lab-vitals*.json`). Treat them as lab figures for a relative comparison, not as Lighthouse scores and not as field data.

**Profile A — Lighthouse-like "slow 4G": 150 ms RTT, 1.6 Mbps, 4× CPU (home page)**

| Metric | Baseline | Branch | Δ |
| --- | --- | --- | --- |
| LCP (knot image) | 2,228 ms | 2,260 ms | +32 ms (+1.4 %) |
| CLS before / after full scroll | 0 / 0 | 0 / 0 | 0 |
| Long-task time over load + scroll | 264 ms | 283 ms | +19 ms |
| `load` | 2,400 ms | 2,426 ms | +26 ms |

**Profile B — harsh: 400 ms RTT, 400 kbps, 4× CPU (all three routes)**

| Route | Metric | Baseline | Branch | Δ |
| --- | --- | --- | --- | --- |
| `/` | LCP (knot image) | 3,924 ms | 4,264 ms | +340 ms (+8.7 %) |
| `/` | CLS before / after scroll | 0.0105 / 0.0105 | 0.0105 / 0.0105 | 0 (pre-existing hero shift, unchanged) |
| `/` | long tasks | 59 ms | 63 ms | +4 ms |
| strategy service | LCP (lead paragraph) | 3,072 ms | 2,992 ms | −80 ms |
| strategy service | CLS | 0 | 0 | 0 |
| creative service | LCP (hero image → lead paragraph) | 2,876 ms | 3,064 ms | +188 ms |
| creative service | CLS | 0 | 0 | 0 |

The home-page regression under profile B exceeds the 200 ms investigation threshold, so it was traced (`scratchpad/lcp-trace.mjs`, resource timings vs. LCP entries): the HTML grew from 24.2 KB to 27.0 KB transferred (nine layer `<img>` elements each carry an 11-candidate `srcset`), and on a 400 ms-RTT connection Chromium widens its lazy-load margin so the first two diagnosis scenes (six layers, ≈53 KB AVIF) start downloading at ≈2.5 s, before the hero's LCP image has finished — the baseline fetched two flattened photos (≈27 KB) in the same window. The extra bytes share a 400 kbps pipe with the LCP image. Mitigations already in the branch: the controller module is imported on demand after hydration (the page's own client chunk did not grow), every below-fold layer is `loading="lazy"` + `fetchpriority="low"`, and the service heroes are the only eager layers. Under profile A the same mechanism costs 32 ms, within the gate. Optional follow-ups if the harsh profile matters for the audience: trim `images.deviceSizes` (shorter `srcset` for every image on the site, −2 KB HTML) and serve the diagnosis layers at `quality={60}` (≈−30 % bytes); neither was applied because they change behaviour outside this upgrade's footprint.

### 5.4 Layout shift and main thread

- Scene stages reserve their footprint with `aspect-ratio`; the browser suite asserts identical stage height and document height before and after enhancement (CLS from the scenes: 0 in the lab).
- Scroll work: native `ViewTimeline` (compositor-driven) in current Chromium; the JS fallback does one rAF per scroll event over the near scenes only. No per-frame React state, no filters, no backdrop blur, no full-resolution duplicate layers.
- A real mid-range Android trace was not recorded (no device available); this is listed in §7.

## 6. Accessibility and SEO

- One meaningful description per scene on the stage (`role="img"` + the original Turkish alt text); every layer image is `alt=""` + `aria-hidden`, `pointer-events: none`; nothing inside a scene is focusable; no live region announces winks.
- Headline entrances keep one semantic heading per instance and the accessible text with spaces; clips carry the same diacritic padding as the existing load mask.
- Reduced motion: no animation objects are created, lids stay hidden, text is never armed; a runtime preference change tears motion down (tested).
- Metadata, canonicals, OG/Twitter images, JSON-LD (`Organization`, `Service`, `FAQPage`, `BreadcrumbList`), sitemap, robots, `lang="tr"`, skip link, mobile menu and the native FAQ are untouched; the route/H1/metadata test checks the rendered head.

## 7. Known limitations and next actions

| Limitation | Status | Next action |
| --- | --- | --- |
| Source artwork is the committed JPEG crops, not the original poster PNGs. | Engineering complete; artwork quality bounded by the 640–1042 px sources. | Re-run `scripts/motion-layers/extract.py` against the originals when the agency supplies them (the owl crop and the pawns gain the most). |
| The box interior behind the low heart is reconstructed (inpainted cardboard with synthetic grain, redrawn flap edge). | Reads correctly at 1×; softer than the photo at 2×. | Optional retouch of `box-rear` by an illustrator, or extraction from the original PNG. |
| Eyelids are authored patches, not photographs of closed eyes. | Convincing at display size, deliberately brief (315 ms). | If the agency has a closed-eye frame of the same owl, swap the two lid PNGs; the manifest and timings stay. |
| Unknown service slugs answer 200 + the 404 page under self-hosted `next start` (404 on Vercel). | Pre-existing, identical on `main` (verified with a baseline build); the test accepts both and checks the 404 page content and `noindex`. | Not part of this upgrade; worth a look at `instant = false` behaviour with the Next.js team if self-hosting is ever used. |
| Chromium and WebKit were run (desktop + mobile emulation); both use the native ViewTimeline driver, and the fallback driver is exercised by deleting `ViewTimeline`. Firefox could not be run: Playwright's Firefox 1555 fails to start on this Windows 11 machine (side-by-side manifest error for its private `mozglue` assembly, reproduced after a forced reinstall). | Firefox project present but opt-in (`E2E_FIREFOX=1`). | Run `E2E_FIREFOX=1 npm run test:e2e` on a Linux/macOS machine or CI runner (where Playwright's Firefox starts) — Firefox 144+ should take the native path, older Firefox the fallback; test on a real iPhone and Android device. |
| No field data; no real mid-range device trace. | Lab-only numbers in §5. | After deployment, read CrUX / RUM INP and LCP segmented by device; record a Performance panel trace on a mid-range Android while scrolling the home page. |
| Lighthouse ran against local `next start` (no CDN, no Brotli), so absolute numbers are not production numbers. | Baseline and branch were measured identically (same machine, same preset, three runs, median). | Repeat on the preview deployment once this branch is deployed. |
| Save-Data is detected but nothing optional depends on it (there is no tilt or idle motion to drop). | By design. | None. |
| No site-level "Hareketi azalt" control was added. | The OS preference is honoured, including runtime changes. | Add a footer toggle only if the client asks; it must never override an OS reduce request. |
