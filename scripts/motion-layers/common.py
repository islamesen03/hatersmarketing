"""Shared helpers for the motion-layer extraction pipeline (offline authoring step).

Run with the project's uv-managed environment, see scripts/motion-layers/README.md.
Everything here works in *artboard pixels*: each scene has one artboard (the source
crop) and every exported layer records its offset back into that artboard.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, asdict
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public" / "images"
SRC_DIR = ROOT / "assets" / "motion-src"
OUT_DIR = ROOT / "public" / "images" / "motion"


def load_rgb(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGB")
    return np.asarray(im).astype(np.float32)


def smoothstep(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def poly_mask(shape, pts, blur: float = 0.0) -> np.ndarray:
    """Float mask (0..1) for a polygon given in (x, y) artboard pixels."""
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32).reshape(-1, 1, 2)], 255)
    f = m.astype(np.float32) / 255.0
    if blur > 0:
        f = cv2.GaussianBlur(f, (0, 0), blur)
    return f


def ellipse_mask(shape, center, axes, angle_deg: float, blur: float = 0.0) -> np.ndarray:
    m = np.zeros(shape[:2], np.uint8)
    cv2.ellipse(m, (int(round(center[0])), int(round(center[1]))), (int(axes[0]), int(axes[1])), angle_deg, 0, 360, 255, -1)
    f = m.astype(np.float32) / 255.0
    if blur > 0:
        f = cv2.GaussianBlur(f, (0, 0), blur)
    return f


def dilate(mask: np.ndarray, px: int) -> np.ndarray:
    if px <= 0:
        return mask
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
    return cv2.dilate(mask, k)


def erode(mask: np.ndarray, px: int) -> np.ndarray:
    if px <= 0:
        return mask
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1))
    return cv2.erode(mask, k)


def fill_holes(mask01: np.ndarray) -> np.ndarray:
    """Fill enclosed holes of a binary mask (float 0/1)."""
    m = (mask01 > 0.5).astype(np.uint8)
    h, w = m.shape
    flood = m.copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff, (0, 0), 1)
    holes = (flood == 0) & (m == 0)
    out = m.copy()
    out[holes] = 1
    return out.astype(np.float32)


def largest_component(mask01: np.ndarray) -> np.ndarray:
    m = (mask01 > 0.5).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1:
        return mask01
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return (labels == idx).astype(np.float32)


def unmix(rgb: np.ndarray, alpha: np.ndarray, bg: tuple[float, float, float]) -> np.ndarray:
    """Remove the backdrop contribution from semi-transparent edge pixels.

    For a pixel that is `alpha` foreground over a flat backdrop `bg`, the observed colour
    is fg*alpha + bg*(1-alpha). Solving for fg stops a light halo appearing on black.
    """
    a = np.clip(alpha, 1e-4, 1.0)[..., None]
    bgv = np.array(bg, np.float32)[None, None, :]
    fg = (rgb - (1 - a) * bgv) / a
    return np.where(alpha[..., None] > 0.999, rgb, np.clip(fg, 0, 255))


def rgba(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    out = np.zeros((rgb.shape[0], rgb.shape[1], 4), np.uint8)
    out[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out[..., 3] = np.clip(alpha * 255.0, 0, 255).astype(np.uint8)
    out[out[..., 3] == 0, :3] = 0
    return out


def trim(img: np.ndarray, pad: int = 2):
    """Crop an RGBA image to its opaque bounds (+pad). Returns (cropped, x, y)."""
    ys, xs = np.where(img[..., 3] > 0)
    if len(xs) == 0:
        return img, 0, 0
    x0 = max(0, xs.min() - pad)
    y0 = max(0, ys.min() - pad)
    x1 = min(img.shape[1], xs.max() + 1 + pad)
    y1 = min(img.shape[0], ys.max() + 1 + pad)
    return img[y0:y1, x0:x1], int(x0), int(y0)


def save_png(img: np.ndarray, path: Path) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(img, "RGBA" if img.shape[2] == 4 else "RGB").save(path, optimize=True)
    return os.path.getsize(path)


def composite_over(img: np.ndarray, bg: tuple[int, int, int]) -> np.ndarray:
    base = np.zeros((img.shape[0], img.shape[1], 3), np.float32) + np.array(bg, np.float32)
    a = img[..., 3:4].astype(np.float32) / 255.0
    return np.clip(base * (1 - a) + img[..., :3].astype(np.float32) * a, 0, 255).astype(np.uint8)


def checker(shape, size=16) -> np.ndarray:
    h, w = shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    c = (((yy // size) + (xx // size)) % 2) * 60 + 150
    return np.stack([c, c, c], -1).astype(np.uint8)


def composite_over_checker(img: np.ndarray) -> np.ndarray:
    base = checker(img.shape).astype(np.float32)
    a = img[..., 3:4].astype(np.float32) / 255.0
    return np.clip(base * (1 - a) + img[..., :3].astype(np.float32) * a, 0, 255).astype(np.uint8)


@dataclass
class Layer:
    name: str
    file: str
    x: int
    y: int
    width: int
    height: int
    z: int
    role: str
    bytes: int
    pivot: list[float] | None = None
    note: str = ""


@dataclass
class SceneManifest:
    id: str
    source: str
    artboard: dict
    layers: list[Layer] = field(default_factory=list)
    anchors: dict = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)

    def to_json(self):
        d = asdict(self)
        return d


def write_manifest(scenes: list[SceneManifest], path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    data = {"version": 1, "scenes": [s.to_json() for s in scenes]}
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def rembg_alpha(rgb_uint8: np.ndarray, model: str) -> np.ndarray:
    """Alpha (0..1) from a rembg segmentation model; models are cached in ~/.u2net."""
    from rembg import new_session, remove

    sess = new_session(model)
    im = Image.fromarray(rgb_uint8, "RGB")
    out = remove(im, session=sess, alpha_matting=False, post_process_mask=False)
    return np.asarray(out.split()[-1]).astype(np.float32) / 255.0


def review_sheet(images: list[np.ndarray], path: Path, gap: int = 12, bg=(0, 128, 0)):
    h = max(i.shape[0] for i in images)
    w = sum(i.shape[1] for i in images) + gap * (len(images) - 1)
    sheet = np.zeros((h, w, 3), np.uint8)
    sheet[:] = bg
    x = 0
    for im in images:
        sheet[: im.shape[0], x : x + im.shape[1]] = im[..., :3]
        x += im.shape[1] + gap
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(sheet).save(path)


def zoom(img: np.ndarray, box, scale: float) -> np.ndarray:
    x0, y0, x1, y1 = box
    crop = img[y0:y1, x0:x1]
    return cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_NEAREST)
