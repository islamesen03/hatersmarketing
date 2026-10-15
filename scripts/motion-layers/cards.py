"""Creative cards scene: cream stack body, top card, red foreground card.

Artboard = public/images/objects/kartlar.jpg (860x572), the committed crop of
"Aynı görsel, yeni beklenti-2.png" (no poster copy of this one exists in the repo).
"""
from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

from common import (
    PUBLIC,
    SceneManifest,
    composite_over,
    composite_over_checker,
    dilate,
    erode,
    load_rgb,
    poly_mask,
    rembg_alpha,
    review_sheet,
    rgba,
    smoothstep,
    unmix,
    zoom,
)

SRC = PUBLIC / "objects" / "kartlar.jpg"
BACKDROP = (241.0, 238.0, 231.0)

# Red card corners (TL, TR, BR, BL) and its rotation pivot (bottom-left corner).
RED = [(178, 212), (555, 340), (455, 548), (28, 405)]
# Stack outline: A (top, cut by the frame), B (right), B' , C' (front-bottom), D' , D (left).
STACK = [(443, -4), (838, 100), (848, 255), (705, 392), (330, 247), (315, 148)]
# Top face of the stack (A, B, C, D); the top card is this face plus ~3px of paper edge.
TOP_FACE = [(443, -4), (838, 100), (712, 232), (315, 148)]
CIRCLE = ((570, 120), (80, 52), 4.0)
PIVOTS = {"red-card": (28.0, 405.0), "top-card": (315.0, 148.0)}


def build(review_dir: Path | None = None) -> tuple[SceneManifest, dict[str, np.ndarray]]:
    rgb = load_rgb(SRC)
    h, w = rgb.shape[:2]
    scene_alpha = rembg_alpha(rgb.astype(np.uint8), "birefnet-general-lite")
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    redness = r - np.maximum(g, b)

    # ---- red card: hue inside the authored quad (the quad is generous by 4px) ----
    red_zone = poly_mask(rgb.shape, RED)
    red_zone_wide = dilate(red_zone, 4)
    red_alpha = smoothstep(redness, 18, 60) * red_zone_wide
    # the two cream circles are part of the card: fill holes inside the quad
    core = (red_alpha > 0.5).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    core_f = core.astype(np.float32)
    # circles: everything inside the red outline
    filled = core_f.copy()
    cnts, _ = cv2.findContours(core, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(filled, cnts, -1, 1.0, -1)
    ring = dilate(filled, 2) - erode(filled, 2)
    red_alpha = np.where(ring > 0, np.clip(red_alpha * dilate(filled, 2) + (filled * (1 - ring)), 0, 1), filled)
    red_alpha = np.minimum(np.clip(red_alpha, 0, 1), np.maximum(scene_alpha, 0))
    # paper thickness at the bottom-right edges is slightly lighter red; keep it (inside filled)
    red_rgb = unmix(rgb, np.where(scene_alpha < 0.999, scene_alpha, 1.0), BACKDROP)

    # ---- stack: segmentation minus the red card, bounded by the authored outline ----
    stack_zone = poly_mask(rgb.shape, STACK)
    stack_zone = dilate(stack_zone, 3)
    stack_alpha = np.clip(scene_alpha * stack_zone - dilate((red_alpha > 0.4).astype(np.float32), 1), 0, 1)
    stack_rgb = unmix(rgb, np.where(scene_alpha < 0.999, scene_alpha, 1.0), BACKDROP)

    # Reconstruct the strip of the stack's front side that the red card hides in the photo
    # (it shows for a moment while the card swings), using the side face further right.
    hidden = (dilate((red_alpha > 0.4).astype(np.float32), 3) > 0) & (stack_zone > 0.5)
    # only the part of the hidden area that belongs to the stack's side faces
    side_zone = poly_mask(rgb.shape, [(315, 148), (712, 232), (848, 255), (705, 392), (330, 247)])
    hidden = hidden & (side_zone > 0.5)
    unreliable = ((scene_alpha < 0.6) | (dilate((red_alpha > 0.3).astype(np.float32), 2) > 0)).astype(np.uint8)
    base = np.clip(rgb, 0, 255).astype(np.uint8)
    inpainted = cv2.inpaint(cv2.cvtColor(base, cv2.COLOR_RGB2BGR), unreliable * 255, 9, cv2.INPAINT_TELEA)
    inpainted = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB).astype(np.float32)
    detail = rgb - cv2.GaussianBlur(rgb, (0, 0), 2.0)
    yy, xx = np.mgrid[0:h, 0:w]
    # the side face runs down-right; copy grain from 120px further along it
    sx = np.clip(xx + 120, 0, w - 1)
    sy = np.clip(yy + 48, 0, h - 1)
    body_rgb = np.where(hidden[..., None], inpainted + detail[sy, sx] * 0.9, stack_rgb)
    body_alpha = np.clip(stack_alpha + hidden, 0, 1) * stack_zone
    body_alpha = np.minimum(body_alpha, np.maximum(scene_alpha, hidden))

    # ---- top card: the top face (+3px paper edge) from the original pixels ----
    top_poly = poly_mask(rgb.shape, TOP_FACE)
    top_edge = poly_mask(rgb.shape, [(443, -4), (838, 100), (840, 104), (713, 236), (316, 152), (315, 148)])
    top_alpha = np.clip(top_poly + top_edge, 0, 1) * body_alpha
    top_rgb = stack_rgb

    # The body keeps a "second card" under the top card: the top face with the circle
    # removed (inpainted from the paper around it) and darkened a little.
    # the circle is everything dark on the top face (plus a margin), not just the ellipse guess
    dark = ((lum_top := rgb.mean(axis=2)) < 120) & (top_poly > 0.5)
    circle = np.zeros(rgb.shape[:2], np.uint8)
    cv2.ellipse(circle, CIRCLE[0], CIRCLE[1], CIRCLE[2], 0, 360, 255, -1)
    circle = np.maximum(circle, (dark * 255).astype(np.uint8))
    circle = cv2.dilate(circle, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    del lum_top
    paper = cv2.inpaint(cv2.cvtColor(base, cv2.COLOR_RGB2BGR), circle, 12, cv2.INPAINT_TELEA)
    paper = cv2.cvtColor(paper, cv2.COLOR_BGR2RGB).astype(np.float32)
    paper = np.where((circle > 0)[..., None], paper + detail[np.clip(yy - 90, 0, h - 1), np.clip(xx + 60, 0, w - 1)] * 0.7, paper)
    second = paper * 0.955
    body_rgb = np.where((top_poly > 0.5)[..., None], second, body_rgb)

    layers = {
        "stack-body": rgba(body_rgb, body_alpha),
        "top-card": rgba(top_rgb, top_alpha),
        "red-card": rgba(red_rgb, red_alpha),
    }

    manifest = SceneManifest(
        id="cards",
        source="public/images/objects/kartlar.jpg (crop of the poster PNG; original not in repo)",
        artboard={"width": w, "height": h},
        anchors={
            "redCard": {"corners": RED, "pivot": list(PIVOTS["red-card"]), "axis": [0.947, 0.321]},
            "topCard": {"corners": TOP_FACE, "pivot": list(PIVOTS["top-card"])},
            "circle": {"center": list(CIRCLE[0]), "axes": list(CIRCLE[1]), "angle": CIRCLE[2]},
        },
        notes=[
            "Scene mask: rembg birefnet-general-lite (isnet left the top face semi-transparent).",
            "Red card keyed by hue inside its authored quad; the cream circles are filled in as part of the card.",
            "Stack body: strip hidden behind the red card's corner reconstructed from the side face (inpaint + grain copy); a circle-free 'second card' fills the top face under the top card.",
            "Top card: top face polygon plus ~3px of paper edge from the original pixels.",
        ],
    )

    if review_dir:
        review_dir.mkdir(parents=True, exist_ok=True)
        keys = ("stack-body", "top-card", "red-card")
        review_sheet([composite_over(layers[k], (12, 12, 12)) for k in keys], review_dir / "cards-layers-black.png")
        review_sheet([composite_over_checker(layers[k]) for k in keys], review_dir / "cards-layers-checker.png")
        comp = np.zeros((h, w, 3), np.float32) + 12
        for k in keys:
            a = layers[k][..., 3:4].astype(np.float32) / 255
            comp = comp * (1 - a) + layers[k][..., :3].astype(np.float32) * a
        review_sheet([comp.astype(np.uint8), composite_over(rgba(rgb, scene_alpha), (12, 12, 12))], review_dir / "cards-composed-vs-cutout.png")
        review_sheet(
            [zoom(composite_over(layers["stack-body"], (12, 12, 12)), (300, 100, 620, 420), 2.0), zoom(composite_over(layers["red-card"], (12, 12, 12)), (380, 280, 600, 420), 2.5)],
            review_dir / "cards-zoom.png",
        )
    return manifest, layers
