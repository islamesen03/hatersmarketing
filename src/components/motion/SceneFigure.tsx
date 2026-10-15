import Image from "next/image";
import { motionScenes, type MotionLayer, type MotionScene } from "@/content/motion-assets";
import type { Picture } from "@/content/types";
import { cn } from "@/lib/cn";

type Props = {
  picture: Picture;
  /** `sizes` of the whole figure (the stage); layer sizes are derived from it. */
  sizes: string;
  /** Classes for the plain `<Image>` when the picture has no scene. */
  className?: string;
  /** Above-the-fold scenes load their layers eagerly. */
  eager?: boolean;
  /** Extra props for the plain-image fallback (e.g. data-drift). */
  plainProps?: Record<string, string>;
};

const pct = (value: number) => `${(value * 100).toFixed(4)}%`;

/** Scale every `NNvw` term of the stage's `sizes` by the layer's share of the artboard. */
function layerSizes(sizes: string, share: number) {
  return sizes.replace(/(\d+(?:\.\d+)?)vw/g, (_, n: string) => `${Math.ceil(Number(n) * share)}vw`);
}

/**
 * A photographed object rendered as its separable layers: server markup, fixed intrinsic
 * geometry (no layout shift), every layer at its photographed position by default. Without
 * JavaScript, with reduced motion, or when a layer fails, this is exactly the still image.
 * The scroll choreography is attached by MotionBoundary.
 */
export function SceneFigure({ picture, sizes, className, eager, plainProps }: Props) {
  const scene: MotionScene | undefined = picture.scene ? motionScenes[picture.scene] : undefined;
  if (!scene) {
    return (
      <Image
        src={picture.src}
        alt={picture.alt}
        width={picture.width}
        height={picture.height}
        sizes={sizes}
        loading={eager ? "eager" : undefined}
        className={className}
        {...plainProps}
      />
    );
  }
  const { artboard, layers } = scene;
  return (
    <div className={cn("scene", `scene--${scene.id}`)} data-scene={scene.id}>
      <div
        role="img"
        aria-label={picture.alt}
        className="scene__stage"
        style={{ aspectRatio: `${artboard.width} / ${artboard.height}` }}
      >
        <div className="scene__field" aria-hidden="true" />
        {layers.map((layer: MotionLayer) => (
          <div
            key={layer.name}
            className={cn("scene__layer", layer.role === "wink" && "scene__lid")}
            data-layer={layer.name}
            data-role={layer.role}
            style={{
              left: pct(layer.x / artboard.width),
              top: pct(layer.y / artboard.height),
              width: pct(layer.width / artboard.width),
              height: pct(layer.height / artboard.height),
              zIndex: layer.z,
              transformOrigin: layer.pivot ? `${pct(layer.pivot[0])} ${pct(layer.pivot[1])}` : undefined,
            }}
          >
            <Image
              src={layer.file}
              alt=""
              aria-hidden="true"
              fill
              sizes={layerSizes(sizes, layer.width / artboard.width)}
              loading={eager ? "eager" : "lazy"}
              // Below-the-fold layers must never compete with the hero's LCP image on slow links.
              fetchPriority={eager ? "auto" : "low"}
              draggable={false}
              className="object-contain"
            />
          </div>
        ))}
        <div className="scene__pivot" aria-hidden="true" />
      </div>
    </div>
  );
}
