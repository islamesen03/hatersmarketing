"""Owl scene: portrait cutout (red backdrop keyed out) and two textured eyelids.

Artboard = a crop of public/images/posters/algoritmayi-suclamadan-once.jpg (1122x1402):
x 330..1122, y 440..1305 (792x865). The poster carries more of the head than the old
object crop (the viewer-left ear tuft is complete), and stops above the "07 / TEKLİF" label.
Poster type that touches the crop ("...akalım.", the bottom of "SUÇLAMADAN", the right
edge of "ÖNCE.") is knocked out by authored zones. The right tuft and the body bleed off
the frame on purpose (the stage's red field keeps that edge, as in the poster).
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
    ellipse_mask,
    load_rgb,
    poly_mask,
    review_sheet,
    rgba,
    smoothstep,
    zoom,
)

SRC = PUBLIC / "posters" / "algoritmayi-suclamadan-once.jpg"
CROP = (330, 440, 1122, 1305)  # x0, y0, x1, y1 in poster px
RED_BG = (231.0, 67.0, 45.0)

# Eye geometry in ARTBOARD px (poster - crop origin). Names are from the viewer's side.
EYES = {
    "viewer-left": {"center": (398.0, 358.0), "axes": (74, 46), "angle": -9.0},
    "viewer-right": {"center": (711.0, 281.0), "axes": (74, 46), "angle": -13.0},
}
# Cheek feathers below the viewer-left eye: the lid texture for both eyes.
LID_TEXTURE_SRC = (330, 418)  # top-left of a 170x90 patch, artboard px


def knock_out_type(alpha: np.ndarray, rgb: np.ndarray) -> np.ndarray:
    """Remove cream poster type that overlaps the crop. Letters are connected blobs of
    bright, unsaturated pixels; the owl's own bright feathers are never this large and
    never touch the crop's top edge."""
    h, w = alpha.shape
    lum = rgb.mean(axis=2)
    sat = (rgb.max(axis=2) - rgb.min(axis=2)) / np.maximum(rgb.max(axis=2), 1)
    cream = ((lum > 170) & (sat < 0.18)).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(cream, 8)
    kill = np.zeros((h, w), np.uint8)
    for i in range(1, n):
        x, y, bw, bh, area = stats[i]
        touches_top = y <= 2 and x < 720  # "SUÇLAMADAN" bottoms (the right tuft is dark)
        left_margin = x + bw <= 125 and y < 330  # "ÖNCE." right edge and its full stop
        akalim = x + bw <= 210 and 240 <= y and y + bh <= 440 and area < 6000  # "...akalım."
        if touches_top or left_margin or akalim:
            kill[labels == i] = 1
    kill = dilate(kill.astype(np.float32), 4)
    return alpha * (1 - kill)


def build(review_dir: Path | None = None) -> tuple[SceneManifest, dict[str, np.ndarray]]:
    full = load_rgb(SRC)
    x0, y0, x1, y1 = CROP
    rgb = full[y0:y1, x0:x1].copy()
    h, w = rgb.shape[:2]
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    redness = r - np.maximum(g, b)
    # chroma key: the owl is monochrome, the backdrop is saturated brand red
    alpha = 1.0 - smoothstep(redness, 40, 120)
    alpha = knock_out_type(alpha, rgb)
    # the portrait is one connected silhouette: drop stray specks (letter remnants,
    # anti-aliasing crumbs) that are not attached to it
    comp = (alpha > 0.3).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(comp, 8)
    if n > 1:
        main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        alpha = np.where(labels == main, alpha, 0.0)
    # Where "akalım." sat on the edge feathers, the knock-out leaves holes inside the
    # silhouette: close them and fill with the feather streaks from just above.
    zone = poly_mask(rgb.shape, [(150, 300), (230, 300), (230, 445), (150, 445)])
    closed = cv2.morphologyEx((alpha > 0.5).astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
    holes = ((closed > 0) & (alpha < 0.5) & (zone > 0.5)).astype(np.float32)
    holes = cv2.GaussianBlur(holes, (0, 0), 1.0)
    yy0, xx0 = np.mgrid[0:h, 0:w]
    clone = rgb[np.clip(yy0 - 46, 0, h - 1), xx0]
    rgb = np.where((holes > 0.02)[..., None], clone * holes[..., None] + rgb * (1 - holes[..., None]), rgb)
    alpha = np.maximum(alpha, holes * (1.0 - smoothstep(rgb[..., 0] - np.maximum(rgb[..., 1], rgb[..., 2]), 40, 120)))
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # un-mix the red spill from semi-transparent feather edges
    a = np.clip(alpha, 1e-3, 1)[..., None]
    bgv = np.array(RED_BG, np.float32)[None, None, :]
    owl_rgb = np.where(alpha[..., None] > 0.999, rgb, np.clip((rgb - (1 - a) * bgv) / a, 0, 255))
    # the owl is a monochrome print: any remaining red tint is spill, pull it to grey
    grey = owl_rgb.mean(axis=2, keepdims=True)
    spill = smoothstep(np.abs(owl_rgb[..., 0] - np.maximum(owl_rgb[..., 1], owl_rgb[..., 2])), 8, 30)[..., None]
    owl_rgb = owl_rgb * (1 - spill * 0.92) + grey * spill * 0.92
    # nearly transparent fringe pixels carry no reliable colour: make them grey
    fringe = (alpha < 0.3)[..., None]
    owl_rgb = np.where(fringe, grey, owl_rgb)

    layers = {"owl": rgba(owl_rgb, alpha)}

    # ---- eyelids: feathered lid texture from the cheek, shaped to each eye ----
    tx, ty = LID_TEXTURE_SRC
    tex = owl_rgb[ty : ty + 90, tx : tx + 170]
    tex = cv2.GaussianBlur(tex, (0, 0), 0.6)
    yy, xx = np.mgrid[0:h, 0:w]
    for name, eye in EYES.items():
        cx, cy = eye["center"]
        ax, ay = eye["axes"]
        shape_mask = ellipse_mask(rgb.shape, (cx, cy), (ax + 8, ay + 8), eye["angle"], blur=3.0)
        # map the lid area onto the texture patch (tiled, mirrored for the right eye)
        u = (xx - (cx - ax - 10)).astype(np.int32)
        v = (yy - (cy - ay - 10)).astype(np.int32)
        if name == "viewer-right":
            u = tex.shape[1] - 1 - u
        u = np.abs(u) % (2 * tex.shape[1])
        u = np.where(u >= tex.shape[1], 2 * tex.shape[1] - 1 - u, u)
        v = np.abs(v) % (2 * tex.shape[0])
        v = np.where(v >= tex.shape[0], 2 * tex.shape[0] - 1 - v, v)
        patch = tex[v, u]
        # shading: darker under the brow (top) and a dark crease along the lower lid
        top_shade = ellipse_mask(rgb.shape, (cx, cy - ay * 0.6), (ax + 8, ay * 0.6), eye["angle"], blur=7.0)
        lid_rgb = patch * (1 - top_shade[..., None] * 0.22)
        crease = np.zeros(rgb.shape[:2], np.float32)
        cv2.ellipse(crease, (int(cx), int(cy + 3)), (ax + 1, ay - 1), eye["angle"], 12, 168, 1.0, 3, cv2.LINE_AA)
        crease = cv2.GaussianBlur(crease, (0, 0), 1.1)
        lid_rgb = lid_rgb * (1 - crease[..., None] * 0.8) + np.array((26, 23, 21), np.float32) * crease[..., None] * 0.8
        lid_alpha = np.clip(shape_mask, 0, 1) * np.clip(alpha, 0, 1)
        layers[f"lid-{name}"] = rgba(lid_rgb, lid_alpha)

    manifest = SceneManifest(
        id="owl",
        source="public/images/posters/algoritmayi-suclamadan-once.jpg crop x330-1122 y440-1305 (poster PNG original not in repo)",
        artboard={"width": w, "height": h},
        anchors={
            "crop": {"x": x0, "y": y0},
            "eyes": {k: {"center": list(v["center"]), "axes": list(v["axes"]), "angle": v["angle"]} for k, v in EYES.items()},
            "bleedEdges": ["top-right", "right", "bottom"],
        },
        notes=[
            "Portrait keyed from the saturated red backdrop (redness smoothstep 40..120), red spill removed on edge pixels, residual tint greyed.",
            "Poster type overlapping the crop is knocked out by connected-component rules (touching the top edge, the left margin, the 'akalım.' zone).",
            "Eyelids: cheek feather texture (below the viewer-left eye) mapped over each eye, soft ellipse mask (+8px), brow shade at the top, dark crease along the lower lid.",
            "The right tuft, right side and body bleed off the artboard; the page keeps a red field on that side so the cut edge reads as the poster's frame.",
        ],
    )

    if review_dir:
        review_dir.mkdir(parents=True, exist_ok=True)
        review_sheet([composite_over(layers["owl"], (12, 12, 12)), composite_over_checker(layers["owl"])], review_dir / "owl-layers.png")
        comp = composite_over(layers["owl"], (12, 12, 12)).astype(np.float32)
        both = comp.copy()
        for name in EYES:
            lid = layers[f"lid-{name}"]
            la = lid[..., 3:4].astype(np.float32) / 255
            both = both * (1 - la) + lid[..., :3].astype(np.float32) * la
        review_sheet([comp.astype(np.uint8), both.astype(np.uint8)], review_dir / "owl-lids.png")
        zl = (300, 280, 500, 440)
        zr = (610, 200, 810, 360)
        review_sheet(
            [zoom(comp.astype(np.uint8), zl, 2.5), zoom(both.astype(np.uint8), zl, 2.5), zoom(comp.astype(np.uint8), zr, 2.5), zoom(both.astype(np.uint8), zr, 2.5)],
            review_dir / "owl-eyes-zoom.png",
        )
        review_sheet([zoom(composite_over(layers["owl"], (12, 12, 12)), (0, 0, 330, 460), 1.5), zoom(composite_over(layers["owl"], (12, 12, 12)), (120, 40, 320, 200), 3.0)], review_dir / "owl-left-edge.png")
    return manifest, layers
