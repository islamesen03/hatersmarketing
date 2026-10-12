"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires a page-level analytics event once; a no-op without consent. */
export function TrackView({ event, label }: { event: string; label: string }) {
  useEffect(() => {
    track(event, { label });
  }, [event, label]);
  return null;
}
