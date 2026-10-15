"""Chess scene: six pawn cutouts (each with its own grounding shadow).

Artboard = public/images/objects/piyonlar.jpg (1042x270), the committed crop of
"Aynı piyonlar, farklı renk-3.png". The pawns sit on a cream CSS field in the page,
so each layer keeps its soft shadow as semi-transparent black.
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
    load_rgb,
    rembg_alpha,
    review_sheet,
    rgba,
    smoothstep,
    unmix,
    zoom,
)

SRC = PUBLIC / "objects" / "piyonlar.jpg"
# x ranges (artboard px) that separate the six pawns, left to right; the last is red.
BANDS = [(20, 185), (185, 352), (352, 520), (520, 686), (686, 852), (852, 1042)]
NAMES = ["pawn-1", "pawn-2", "pawn-3", "pawn-4", "pawn-5", "pawn-red"]
ROLES = {n: "scroll" for n in NAMES}
Z = {n: i + 1 for i, n in enumerate(NAMES)}
# The red pawn grows from its base, so its transform origin is the base centre.
PIVOTS = {"pawn-red": (945.0, 262.0)}


def build(review_dir: Path | None = None) -> tuple[SceneManifest, dict[str, np.ndarray]]:
    rgb = load_rgb(SRC)
    h, w = rgb.shape[:2]
    alpha = rembg_alpha(rgb.astype(np.uint8), "birefnet-general-lite")
    pawn_bin = (alpha > 0.5).astype(np.float32)

    # Backdrop estimate: inpaint the pawns and their shadows away, then smooth.
    base = np.clip(rgb, 0, 255).astype(np.uint8)
    far = (dilate(pawn_bin, 28) * 255).astype(np.uint8)
    bg = cv2.inpaint(cv2.cvtColor(base, cv2.COLOR_RGB2BGR), far, 15, cv2.INPAINT_TELEA)
    bg = cv2.GaussianBlur(cv2.cvtColor(bg, cv2.COLOR_BGR2RGB).astype(np.float32), (0, 0), 12)
    lum = rgb.mean(axis=2)
    bg_lum = bg.mean(axis=2)
    darkness = np.clip((bg_lum - lum) / np.maximum(bg_lum, 1), 0, 1)
    shadow = smoothstep(darkness, 0.025, 0.22) * (1 - dilate(pawn_bin, 1))
    # shadows live under the bases only
    shadow[: 200, :] = 0
    shadow = cv2.GaussianBlur(shadow, (0, 0), 1.0)

    # colour of the cutout edge pixels: unmix against the local backdrop
    bg_tuple = tuple(float(v) for v in bg.reshape(-1, 3).mean(axis=0))
    pawn_rgb = unmix(rgb, np.where(alpha < 0.999, alpha, 1.0), bg_tuple)

    layers = {}
    for name, (x0, x1) in zip(NAMES, BANDS):
        band = np.zeros((h, w), np.float32)
        band[:, x0:x1] = 1
        a_p = alpha * band
        a_s = shadow * band * 0.85
        # composite: pawn over shadow (both in the same artboard)
        out_rgb = np.where((a_p > 0.02)[..., None], pawn_rgb, 0.0)
        out_a = a_p + a_s * (1 - a_p)
        layers[name] = rgba(out_rgb, out_a)

    manifest = SceneManifest(
        id="pawns",
        source="public/images/objects/piyonlar.jpg (crop of the poster PNG; original not in repo)",
        artboard={"width": w, "height": h},
        anchors={"bands": BANDS, "baseline": 246},
        notes=[
            "Cutouts: rembg birefnet-general-lite; pixels split into six layers by x band (true pawn outlines, not rectangles).",
            "Each layer carries its own grounding shadow (black, alpha from darkness vs. an inpainted backdrop estimate) so the shadow moves with the piece.",
        ],
    )

    if review_dir:
        review_dir.mkdir(parents=True, exist_ok=True)
        comp = np.zeros((h, w, 3), np.float32) + np.array((241, 237, 228), np.float32)
        for name in NAMES:
            a = layers[name][..., 3:4].astype(np.float32) / 255
            comp = comp * (1 - a) + layers[name][..., :3].astype(np.float32) * a
        review_sheet([comp.astype(np.uint8)], review_dir / "pawns-composed.png")
        review_sheet([composite_over_checker(layers["pawn-1"]), composite_over_checker(layers["pawn-red"])], review_dir / "pawns-checker.png")
        review_sheet([zoom(composite_over(layers["pawn-red"], (241, 237, 228)), (860, 150, 1040, 270), 3.0), zoom(composite_over(layers["pawn-3"], (241, 237, 228)), (360, 0, 520, 120), 3.0)], review_dir / "pawns-zoom.png")
    return manifest, layers
