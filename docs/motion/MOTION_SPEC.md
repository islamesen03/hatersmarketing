# Motion specification — scroll scenes and text entrances

Branch `feat/ux-motion-upgrade`, October 2026. Companion documents: [ASSET_MANIFEST.md](ASSET_MANIFEST.md) (layers, provenance, sizes) and [REPORT.md](REPORT.md) (change map, tests, performance, limitations).

## 1. Principles

- Additive. Architecture, copy, type, palette, grid, section order, URLs, navigation, footer, CTAs, forms, consent and analytics are untouched. Motion lives inside the footprints that already exist.
- One dominant idea per viewport. Object scenes carry the diagnosis rows and the two service heroes; text entrances carry section titles; everything else stays as it was (`[data-reveal]` fade-ups, the hero knot, the manifesto inversion).
- Native scrolling only. No pinning, no smooth-scroll library, no scroll-jacking, no preloader, no cursor, no particles, no WebGL.
- Progressive enhancement. Server markup is the still image; the client controller only adds animation objects. Without JavaScript, with a failed enhancement, with a missing layer, or under `prefers-reduced-motion: reduce`, the page is the still image and all copy is visible.
- Exactly one driver per scene. Native `ViewTimeline` where supported, otherwise a shared passive scroll driver. Both apply the same keyframes to the same progress definition.

## 2. Progress

A scene is unpinned. Its normalised progress `p ∈ [0, 1]` is defined on the stage's vertical centre moving from **85% to 25% of the usable viewport**, the viewport below the sticky header (`--header-h`, measured at runtime):

```
V  = innerHeight − headerHeight
p  = clamp((0.85·V − (centerY − headerHeight)) / (0.60·V), 0, 1)
```

The native driver expresses the identical range as a `ViewTimeline` whose subject is a 1px pivot at the stage centre with insets `[headerHeight + 0.25·V, 0.15·V]`, so `cover 0% … 100%` is exactly `p = 0 … 1` (verified by `tests/motion.test.mts` and the ViewTimeline `currentTime` assertions in the browser suite). The fallback computes `p` from `getBoundingClientRect()` in one requestAnimationFrame batch per scroll event and sets `animation.currentTime = p × 1000 ms` on paused Web Animations.

Scene progress is deliberately not a CSS `view()` percentage; the existing `[data-reveal]`/`[data-drift]`/knot timelines keep their own semantics.

## 3. Drivers and lifecycle (`src/lib/motion/scene-controller.ts`)

| Concern | Behaviour |
| --- | --- |
| Capability detection | `ViewTimeline` constructor probe + `Animation.prototype.rangeStart` + `CSS.supports("animation-timeline: view()")`; WAAPI required for any motion. Tests simulate an old browser by deleting `window.ViewTimeline` before scripts run. `<html data-motion>` = `native` / `fallback` / `reduced` / `static`. |
| Activation | One IntersectionObserver with `rootMargin: 50%`. Near → animations are created (and `will-change: transform` hinted via `.is-active`); far → animations cancelled, layers return to the still pose, owl thresholds re-armed. |
| Scroll work | One passive `scroll` listener; one rAF per event; reads batched before writes; only near scenes are touched. No per-scene frame loops, no React state per frame. |
| Resize / orientation / breakpoint | Debounced 120 ms: geometry refreshed, animations rebuilt (new insets, compact keyframes below 48 rem). |
| Visibility | Hidden tab cancels in-flight winks and restores open eyes; native timelines simply do not advance. |
| Reduced motion | OS preference only; a change at runtime tears everything down or re-enhances. There is no site-level override that could defeat the OS setting. |
| Navigation / Strict Mode / bfcache | `MotionBoundary` is rendered last inside every page that has motion; it mounts on hydration, re-runs on `pathname` change and on `pageshow` (persisted), and cancels every animation, observer, listener and timer on cleanup. |
| Restored scroll | The first tick after mount sets the real progress; the owl consumes already-passed thresholds silently. |
| Asset failure | Any layer `<img>` error cancels the scene's animations and marks it `data-scene-state="static"`; dimensions never change (aspect-ratio stage). |

Markup (`src/components/motion/SceneFigure.tsx`): `div.scene[data-scene] > div.scene__stage[role=img][aria-label]` with `aspect-ratio: W/H`, an optional `div.scene__field` (owl red, pawns cream), one `div.scene__layer[data-layer][data-role]` per layer positioned in artboard percentages with `next/image fill` inside (alt="", aria-hidden, pointer-events none), and the `div.scene__pivot`. Scene identity comes from the content model (`Picture.scene`), never from headings, indexes or DOM selectors.

## 4. Tokens

| Token | Value |
| --- | --- |
| Editorial easing | `cubic-bezier(0.2, 0.7, 0, 1)` (existing `--ease-editorial`) |
| Text entrance | 760 ms transform, 420 ms opacity, 90 ms line stagger |
| Headline travel | `clamp(12px, 4vw, 72px)` desktop; 20 px below 48 rem |
| Wink cycle | close 110 ms → hold 40 ms → open 165 ms (315 ms), cooldown 500 ms |
| Desktop/compact breakpoint | `(max-width: 47.99rem)` — compact keyframes reduce travel and sway |

## 5. Scenes

Keyframes live in `src/lib/motion/choreography.ts`; offsets are `p`; transforms are percentages of the layer's own box so they hold at every rendered size.

### 5.1 Heart emerges from the box — diagnosis 01 (`/`)

Layers (z): `box-rear` 1 (static) · `balloon` 2 (scroll; pivot = string bottom at F(319, 457) of the 640×660 artboard) · `box-front` 3 (static). The balloon layer carries the foil heart, its knot and the photographed string.

| p | balloon transform (desktop / compact) | Note |
| --- | --- | --- |
| 0 – 0.12 | `translateY(76.75% / 62%)`, 0° | Low inside the box; only the lobe tops show above the near rim. |
| 0.12 – 0.55 | → `translateY(13.8% / 11.2%)`, −1.2° / −0.7° | Rises through the opening (editorial easing); scale constant. |
| 0.55 – 0.78 | → `translateY(0)`, sway +2.2° → −1.5° (compact ±1.2° → −0.8°) | Clears the rim, pendulum about the string bottom. |
| 0.78 – 1 | sway +0.7° → 0° | Settles at the photographed pose; copy and CTA never move. |

Occlusion is geometric: the front layer is every box pixel on or below the near rim polyline L(75,330)–F(320,455)–R′(505,325), lifted 3 px so the rim highlight stays in front. The string's lower part is always behind the near walls (it extends 185 px below the knot, the rim is at most 185 px below the knot at `p = 1`). Reverse scrolling plays the same keyframes backwards. Reduced motion / no-JS: all layers at their photographed positions (heart above the box, string straight).

### 5.2 Owl winks — diagnosis 03 (`/`)

Layers: `owl` 1 (scroll: `translateY(1.6% / 1.1%) → 0` over `p` 0–0.7, so the bleed edge stays below the stage edge) · `lid-viewer-left` 2 · `lid-viewer-right` 3 (wink; hidden by `clip-path: inset(0 0 100% 0)` until a wink animates `inset(0 0 100% 0) → inset(0 0 0 0) → inset(0 0 100% 0)` in 315 ms).

State machine (`src/lib/motion/wink-machine.ts`, unit-tested with a controlled clock):

- Thresholds `0.30` (viewer-right) and `0.68` (viewer-left), hysteresis 0.02, forward crossings only.
- Busy window 815 ms per wink (315 ms play + 500 ms cooldown); at most one further wink queued, played only if the stage is still visible.
- Thresholds are consumed for the visit; reversals never replay; leaving the viewport re-arms; a fresh forward visit winks right then left again.
- Becoming visible mid-scene consumes already-passed thresholds without playing.
- Exit, hidden tab, reduced motion, asset failure and teardown cancel queued work and restore open eyes.

The stage keeps a red brand field on its right 64% (`.scene__field`); the owl's viewer-left tuft, facial disc and shoulder lean out of it over the page. One accessible description on the stage; no live region.

### 5.3 Chess differentiation — strategy service hero

Six layers `pawn-1…5`, `pawn-red` on the stage's cream field (`.scene__field`), each with its own grounding shadow.

| p | Black pawns | Red pawn |
| --- | --- | --- |
| 0 – 0.25 | each from `translate(−2.5%, 4.5%)` to rest, staggered 30 ms-equivalents of `p` (0.00→0.10 … 0.12→0.22); compact `(−1.5%, 3%)` | from `translateY(4.5%)` to rest by 0.25 |
| 0.25 – 0.65 | still | → `translate(−1%, −6%) scale(1.035)` from its base (compact −4.4%, 1.02) |
| 0.65 – 1 | still | holds its distinct position |

### 5.4 Creative cards — diagnosis 02 (`/`) and creative service hero

Layers: `stack-body` 1 (static, includes a circle-free second card under the top card and the reconstructed strip behind the red card) · `top-card` 2 (pivot D(315,148)) · `red-card` 3 (pivot = bottom-left corner (28,405); long axis (0.947, 0.321)).

| p | red card | top card |
| --- | --- | --- |
| 0 – 0.20 | tucked toward the stack along its axis: `translate(15.1%, 8.1%) rotate(−5°)` (compact `10.6%, 5.7%, −3.5°`) | at rest |
| 0.20 – 0.65 | dealt out to the photographed position (editorial easing) | at rest |
| 0.65 – 0.85 | at rest | fans: `translate(−0.9%, −1.1%) rotate(−1.2°)` about D |
| 0.85 – 1 | at rest | holds |

The counter-clockwise tuck covers more of the stack, so no hidden pixels are exposed; the strip under the red card's corner is reconstructed anyway. The service hero reuses the same scene (same keyframes, eager-loaded layers).

## 6. Typography

- `Headline enter="sides"` (diagnosis h3s, closing CTAs on every page, the service-page process title "Dinle. Sorgula. / Sonra yap." — the R1 reference set in the existing content): each line is a `span.enter-line` clip (padding for İ/Ş/Ç), plain lines from the left, the accent line from the right, 760 ms editorial easing, 90 ms stagger. Reveal (`reveal`) and enter are mutually exclusive per instance.
- `data-enter="left"` on section h2s that keep inline red accents (homepage services/gallery/method/demo/FAQ/diagnoses; service "for whom"/"notes"; approach, about, work titles): the block slides 72 px → 0 with a fade.
- Arming happens only in JavaScript, after hydration, for elements **below** the viewport at that moment; elements already in or above the viewport are never hidden. Entrances release on intersection (15%, −6% bottom margin) and never re-arm, so reversing does not hide a read headline. Reduced motion: never armed.
- Body copy keeps the existing `[data-reveal]` fade-up only. Services rows and method steps stagger via `--i` on the same timeline; method rules draw in (`.rule-draw`) where `view()` timelines exist, otherwise they are simply drawn.

## 7. Responsive and failure matrix

| Mode | Behaviour |
| --- | --- |
| Desktop, normal motion | Full choreography; native timelines in Chromium/WebKit/Firefox with scroll-driven animations. |
| < 48 rem / touch | Compact keyframes (shorter travel, smaller sway/rotation, 20 px headline travel); no hover dependency; nothing pinned. |
| Reduced motion | No animations are created; `data-motion="reduced"`; lids hidden; text visible; gallery scrolls with `behavior: auto` (existing). |
| No ViewTimeline | Shared scroll driver scrubs the same keyframes (`data-motion="fallback"`). |
| No WAAPI | Static (`data-motion="static"`). |
| No JavaScript | Still image, visible copy, native FAQ, ordinary links. |
| Layer failed to load | Scene frozen at the still pose, dimensions intact. |
| Save-Data | Exposed by `prefersReducedData()`; nothing optional depends on it today (no tilt, no idle motion). |
