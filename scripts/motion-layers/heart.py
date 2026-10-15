"""Heart-and-box scene: balloon (with its string), box rear, box front.

Artboard = public/images/objects/kalp-ve-kutu.jpg (640x660), the committed crop of
"Beğeni var, sipariş nerede_-4.png" (the original PNG is not in the repository).
Coordinates below were read off a labelled grid/edge overlay of that crop.
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
    fill_holes,
    largest_component,
    load_rgb,
    poly_mask,
    rembg_alpha,
    review_sheet,
    rgba,
    smoothstep,
    unmix,
    zoom,
)

SRC = PUBLIC / "objects" / "kalp-ve-kutu.jpg"
BACKDROP = (240.0, 236.0, 228.0)  # flat studio backdrop sampled at the top-left

# Box opening rhombus and the near rim (front occluder boundary), artboard px.
L, B, R2, F = (75, 330), (262, 252), (505, 325), (320, 455)
LEFT_TIP, RIGHT_TIP = (0, 337), (600, 302)
# Standing back flaps (reconstructed where the balloon hides them).
FLAP_BACK_RIGHT = [B, (285, 193), (548, 214), R2]
FLAP_BACK_LEFT = [(10, 232), (205, 157), B, L]
INTERIOR = [L, B, R2, F]
# Balloon pivot: where the string meets the near corner of the box.
PIVOT = (319.0, 457.0)


def rim_front_polygon(lift: int = 3):
    """Everything on/below the near rim belongs to the front layer. `lift` moves the
    boundary up a few pixels so the rim's highlight edge stays with the front layer."""
    pts = [LEFT_TIP, L, F, R2, RIGHT_TIP, (640, RIGHT_TIP[1])]
    pts = [(x, y - lift) for x, y in pts]
    return pts + [(640, 660), (0, 660)]


def build(review_dir: Path | None = None) -> tuple[SceneManifest, dict[str, np.ndarray]]:
    rgb = load_rgb(SRC)
    h, w = rgb.shape[:2]
    scene_alpha = rembg_alpha(rgb.astype(np.uint8), "isnet-general-use")
    scene_bin = (scene_alpha > 0.5).astype(np.float32)

    # ---- balloon: red hue inside the scene mask, holes (specular highlights) filled ----
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    redness = r - np.maximum(g, b)
    heart_zone = poly_mask(rgb.shape, [(185, 0), (495, 0), (495, 300), (185, 300)])
    heart_core = (redness > 38) * heart_zone * scene_bin
    heart_core = fill_holes(largest_component(heart_core))
    # soft boundary: inside the core keep 1; at the boundary blend by redness
    soft = smoothstep(redness, 14, 48)
    boundary = dilate(heart_core, 2) - erode(heart_core, 2)
    heart_alpha = np.where(boundary > 0, soft * dilate(heart_core, 2), heart_core)
    # the string: a 2px red line below the knot, down to the near corner
    string_zone = poly_mask(rgb.shape, [(309, 262), (331, 262), (331, 462), (309, 462)])
    string_alpha = smoothstep(redness, 10, 40) * string_zone
    string_alpha = np.maximum(string_alpha, (redness > 40) * string_zone)
    balloon_alpha = np.clip(np.maximum(heart_alpha, string_alpha), 0, 1)
    # outer edge against the backdrop uses the segmentation alpha (anti-aliased)
    balloon_alpha = np.minimum(balloon_alpha, scene_alpha)
    balloon_rgb = unmix(rgb, np.where(scene_alpha < 0.999, scene_alpha, 1.0), BACKDROP)

    # ---- box: the scene minus the balloon ----
    balloon_hard = (balloon_alpha > 0.35).astype(np.float32)
    box_alpha = np.clip(scene_alpha - dilate(balloon_hard, 1), 0, 1)
    front_poly = poly_mask(rgb.shape, rim_front_polygon())
    front_alpha = box_alpha * front_poly
    rear_alpha = box_alpha * (1 - front_poly)

    # ---- rear reconstruction: the box as if the balloon were never there ----
    # The string first: a 2-3px vertical line on a smooth surface is repaired exactly by
    # interpolating across it horizontally (no inpainting smear).
    repaired = rgb.copy()
    # the knot (tied foil below the heart) belongs with the heart, not the string
    knot_zone = poly_mask(rgb.shape, [(298, 252), (344, 252), (344, 294), (298, 294)])
    heart_only = np.clip((heart_alpha > 0.35).astype(np.float32) + ((redness > 25) * knot_zone), 0, 1)
    heart_only = fill_holes(heart_only)
    string_cols = ((string_alpha > 0.15) | (dilate((string_alpha > 0.3).astype(np.float32), 2) > 0)) & (dilate(heart_only, 6) == 0)
    ys, xs = np.where(string_cols & (string_zone > 0))
    for yv in np.unique(ys):
        row = xs[ys == yv]
        xa, xb = row.min() - 3, row.max() + 3
        if xa < 0 or xb >= w or xb - xa > 14:
            string_cols[yv, :] = False
            continue
        t = (np.arange(xa, xb + 1) - xa) / (xb - xa)
        repaired[yv, xa : xb + 1] = rgb[yv, xa][None, :] * (1 - t)[:, None] + rgb[yv, xb][None, :] * t[:, None]
    rgb_for_fill = repaired
    # the foil's dark rim has low "redness", so grow the hidden area past it
    hidden = dilate(balloon_hard, 5)
    rear_shape = (
        poly_mask(rgb.shape, FLAP_BACK_RIGHT)
        + poly_mask(rgb.shape, FLAP_BACK_LEFT)
        + poly_mask(rgb.shape, INTERIOR)
    )
    rear_shape = np.clip(rear_shape, 0, 1) * (1 - front_poly)
    fill_region = ((hidden > 0) & (rear_shape > 0.5)).astype(np.uint8)
    rear_alpha = np.clip(rear_alpha + fill_region, 0, 1)
    # Inpaint the hidden pixels from genuine cardboard only: everything that is not
    # reliable box (backdrop, balloon, string) is excluded from the inpainting source so
    # neither the cream backdrop nor the red foil bleeds into the reconstruction. The
    # standing flap's straight edges come from the authored polygons, not the inpainting.
    base = np.clip(rgb_for_fill, 0, 255).astype(np.uint8)
    unreliable = ((scene_alpha < 0.6) | (dilate(heart_only, 6) > 0) | (dilate(balloon_hard, 2) > 0)).astype(np.uint8)
    inpaint_mask = (unreliable * 255).astype(np.uint8)
    rear_bgr = cv2.inpaint(cv2.cvtColor(base, cv2.COLOR_RGB2BGR), inpaint_mask, 9, cv2.INPAINT_TELEA)
    filled = cv2.cvtColor(rear_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    # the string column keeps the exact horizontal interpolation, not the inpainting
    filled = np.where((string_cols & (string_zone > 0))[..., None], rgb_for_fill, filled)
    fill_region = ((dilate(heart_only, 5) > 0) & (rear_shape > 0.5)).astype(np.uint8)
    fill_region = np.clip(fill_region + ((dilate(balloon_hard, 2) > 0) & (rear_shape > 0.5)).astype(np.uint8), 0, 1)
    rear_alpha = np.clip(rear_alpha + fill_region, 0, 1)
    # Put the cardboard grain back: the inpainting is smooth, so add the high-frequency
    # detail of a visible patch of the same surface (shifted copy) inside each hidden area.
    detail = rgb_for_fill - cv2.GaussianBlur(rgb_for_fill, (0, 0), 2.5)
    grain_src = {
        # hidden area -> shift to a visible patch of the same surface
        "flap-right": (poly_mask(rgb.shape, FLAP_BACK_RIGHT), (150, 40)),
        "flap-left": (poly_mask(rgb.shape, FLAP_BACK_LEFT), (-70, 40)),
        "interior": (poly_mask(rgb.shape, INTERIOR), (-60, 60)),
    }
    rear_rgb = filled.copy()
    yy, xx = np.mgrid[0:h, 0:w]
    for _, (region, (dx, dy)) in grain_src.items():
        sel = (fill_region > 0) & (region > 0.5) & ~(string_cols & (string_zone > 0))
        sx = np.clip(xx + dx, 0, w - 1)
        sy = np.clip(yy + dy, 0, h - 1)
        grain = detail[sy, sx]
        rear_rgb = np.where(sel[..., None], filled + grain * 0.8, rear_rgb)
    # keep the flap top edge crisp: a soft darker line along the authored top edge
    # where it was hidden (the inpainting blurs it).
    (x0, y0), (x1, y1) = FLAP_BACK_RIGHT[1], FLAP_BACK_RIGHT[2]
    edge = np.zeros(rgb.shape[:2], np.float32)
    cv2.line(edge, (x0, y0), (x1, y1), 1.0, 2, cv2.LINE_AA)
    edge = edge * fill_region
    edge_col = np.array([168, 165, 160], np.float32)
    rear_rgb = rear_rgb * (1 - edge[..., None] * 0.35) + edge_col * edge[..., None] * 0.35
    rear_rgb = unmix(rear_rgb, np.where(scene_alpha < 0.999, np.maximum(scene_alpha, fill_region), 1.0), BACKDROP)
    front_rgb = unmix(rgb, np.where(scene_alpha < 0.999, scene_alpha, 1.0), BACKDROP)

    layers = {
        "box-rear": rgba(rear_rgb, rear_alpha),
        "balloon": rgba(balloon_rgb, balloon_alpha),
        "box-front": rgba(front_rgb, front_alpha),
    }

    manifest = SceneManifest(
        id="heart-box",
        source="public/images/objects/kalp-ve-kutu.jpg (crop of the poster PNG; original not in repo)",
        artboard={"width": w, "height": h},
        anchors={
            "stringBottom": list(PIVOT),
            "rim": {"L": L, "F": F, "R": R2},
            "balloonKnot": [320, 268],
        },
        notes=[
            "Scene mask: rembg isnet-general-use; balloon separated by red hue with filled specular holes; string keyed in a narrow column.",
            "Rear layer: back flaps + interior reconstructed under the balloon/string with cv2.inpaint (Telea, r=7) inside authored flap polygons; standing-flap top edge redrawn.",
            "Front layer: box pixels on/below the near rim polyline (lifted 3px so the rim highlight occludes the balloon).",
        ],
    )

    if review_dir:
        review_dir.mkdir(parents=True, exist_ok=True)
        keys = ("box-rear", "balloon", "box-front")
        review_sheet([composite_over(layers[k], (12, 12, 12)) for k in keys], review_dir / "heart-layers-black.png")
        review_sheet([composite_over_checker(layers[k]) for k in keys], review_dir / "heart-layers-checker.png")
        comp = np.zeros((h, w, 3), np.float32) + 12
        for k in keys:
            a = layers[k][..., 3:4].astype(np.float32) / 255
            comp = comp * (1 - a) + layers[k][..., :3].astype(np.float32) * a
        review_sheet(
            [comp.astype(np.uint8), composite_over(rgba(rgb, scene_alpha), (12, 12, 12))],
            review_dir / "heart-composed-vs-cutout.png",
        )
        review_sheet([zoom(composite_over(layers["box-rear"], (12, 12, 12)), (180, 120, 520, 320), 2.5)], review_dir / "heart-rear-zoom.png")
        review_sheet(
            [
                zoom(composite_over(layers["balloon"], (12, 12, 12)), (200, 0, 480, 300), 2.0),
                zoom(composite_over(layers["balloon"], (241, 237, 228)), (200, 0, 480, 300), 2.0),
            ],
            review_dir / "heart-balloon-zoom.png",
        )
        review_sheet([zoom(composite_over(layers["balloon"], (12, 12, 12)), (290, 240, 350, 470), 4.0)], review_dir / "heart-string-zoom.png")
    return manifest, layers
