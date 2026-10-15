"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import type { MotionController } from "@/lib/motion/scene-controller";

/**
 * The only client boundary of the motion system. Each page that has scenes or text
 * entrances wraps its content in it (a `display: contents` element, so layout is
 * untouched). The controller is scoped to that element: Next.js keeps previously visited
 * pages mounted but hidden for instant back navigation, and a page must never enhance
 * another page's hidden markup.
 *
 * The controller module is imported on demand after hydration, so the page's own client
 * chunk stays tiny and the enhancement never competes with the hero image for bandwidth.
 * The effect re-runs on `pathname` change and when a hidden page is shown again, and tears
 * every animation, observer, listener and timer down on cleanup; Strict Mode re-runs are
 * harmless. If enhancement fails to load or throws, the page stays in its static state.
 */
export function MotionBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let controller: MotionController | null = null;
    import("@/lib/motion/scene-controller")
      .then((mod) => {
        if (cancelled) return;
        controller = new mod.MotionController(root);
        controller.start();
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") console.error("motion enhancement failed", error);
        controller?.stop();
      });
    return () => {
      cancelled = true;
      controller?.stop();
    };
  }, [pathname]);

  return (
    <div ref={rootRef} data-motion-root="" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
