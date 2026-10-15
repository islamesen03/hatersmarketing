# Motion layers (offline authoring step)

Builds the transparent layers behind the four scroll scenes (heart & box, cards, owl,
pawns) from the committed object crops and posters. The web app never runs this; it
only reads the exported PNGs in `public/images/motion/` and the generated manifest in
`src/content/motion-assets.ts`.

The original 40 poster PNGs are not in the repository (see BRAND_AUDIT.md §6), so the
sources here are the JPEG derivatives in `public/images/`. Quality notes per scene are
recorded in `assets/motion-src/manifest.json` → `notes`.

## Run

Requires Python 3.12 with `numpy`, `opencv-python-headless`, `pillow`, `scipy` and
`rembg[cpu]` (the segmentation models, ~170–225 MB each, are downloaded on first use into
`~/.u2net`). With [uv](https://docs.astral.sh/uv/):

```bash
uv venv --python 3.12 .venv-motion
uv pip install --python .venv-motion/Scripts/python.exe numpy opencv-python-headless pillow scipy "rembg[cpu]"
.venv-motion/Scripts/python.exe -I scripts/motion-layers/extract.py --review .motion-review
```

`--scene heart-box|cards|owl|pawns` limits the run; `--review DIR` writes contact sheets
(layers over black / checkerboard, composed-at-rest vs. the plain cut-out, edge zooms)
that must be looked at before the layers are accepted.

## What each file does

| File | Output |
| --- | --- |
| `heart.py` | `box-rear` (back flaps + interior, balloon/string area reconstructed), `balloon` (foil heart, knot and photographed string), `box-front` (near walls, near flaps, rim) |
| `cards.py` | `stack-body` (stack with a circle-free second card and the strip under the red card reconstructed), `top-card`, `red-card` |
| `owl.py` | `owl` (portrait keyed from the red backdrop, poster type knocked out), `lid-viewer-left`, `lid-viewer-right` (textured eyelids) |
| `pawns.py` | `pawn-1` … `pawn-5`, `pawn-red` (true outlines, each with its own grounding shadow) |
| `extract.py` | trims every layer, records offsets/pivots in artboard pixels, writes the JSON and TS manifests |

All coordinates are artboard pixels of the source crop; a layer's `x`/`y` is its offset
back into that artboard, and `pivot` is the rotation origin as a fraction of the layer box.
