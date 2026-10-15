import { test } from "node:test";
import assert from "node:assert/strict";
import { WinkMachine, type WinkEye } from "../src/lib/motion/wink-machine.ts";
import { PROGRESS_END, PROGRESS_START, sceneProgress, timelineInsets } from "../src/lib/motion/progress.ts";

/** A deterministic clock + scheduler for the wink machine. */
function harness(options: { busyMs?: number } = {}) {
  let now = 0;
  const timers = new Map<number, { at: number; fn: () => void }>();
  let nextId = 1;
  const played: WinkEye[] = [];
  let resets = 0;
  const machine = new WinkMachine({
    busyMs: options.busyMs ?? 820,
    now: () => now,
    setTimeout: (fn, ms) => {
      const id = nextId++;
      timers.set(id, { at: now + ms, fn });
      return id;
    },
    clearTimeout: (id) => {
      timers.delete(id);
    },
    play: (eye) => played.push(eye),
    reset: () => {
      resets += 1;
    },
  });
  const advance = (ms: number) => {
    const target = now + ms;
    while (true) {
      const due = [...timers.entries()].filter(([, t]) => t.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].fn();
    }
    now = target;
  };
  return { machine, played, advance, resets: () => resets };
}

test("winks viewer-right then viewer-left on a forward pass", () => {
  const h = harness();
  h.machine.setVisible(true, 0);
  for (const p of [0.1, 0.2, 0.33, 0.5, 0.6, 0.71, 0.9]) {
    h.machine.update(p);
    h.advance(1000);
  }
  assert.deepEqual(h.played, ["viewerRight", "viewerLeft"]);
});

test("fast traversal queues at most one wink and never overlaps", () => {
  const h = harness({ busyMs: 820 });
  h.machine.setVisible(true, 0);
  h.machine.update(0.35); // fires right immediately
  h.machine.update(0.75); // queued (busy)
  assert.deepEqual(h.played, ["viewerRight"]);
  h.advance(400);
  assert.deepEqual(h.played, ["viewerRight"], "second wink waits for the cooldown");
  h.advance(500);
  assert.deepEqual(h.played, ["viewerRight", "viewerLeft"]);
});

test("reversals around a threshold do not retrigger within a visit", () => {
  const h = harness();
  h.machine.setVisible(true, 0);
  h.machine.update(0.34);
  h.advance(2000);
  h.machine.update(0.28);
  h.machine.update(0.34);
  h.machine.update(0.29);
  h.machine.update(0.35);
  h.advance(2000);
  assert.deepEqual(h.played, ["viewerRight"]);
});

test("reverse traversal keeps eyes open; a fresh visit after leaving replays right then left", () => {
  const h = harness();
  h.machine.setVisible(true, 0);
  h.machine.update(0.9);
  h.advance(2000);
  assert.deepEqual(h.played, ["viewerRight", "viewerLeft"]);
  h.machine.update(0.5);
  h.machine.update(0.1);
  h.advance(2000);
  assert.deepEqual(h.played, ["viewerRight", "viewerLeft"], "scrolling back plays nothing");
  h.machine.setVisible(false);
  h.machine.setVisible(true, 0);
  h.machine.update(0.4);
  h.advance(2000);
  h.machine.update(0.8);
  h.advance(2000);
  assert.deepEqual(h.played, ["viewerRight", "viewerLeft", "viewerRight", "viewerLeft"]);
});

test("becoming visible mid-scene consumes passed thresholds without playing", () => {
  const h = harness();
  h.machine.setVisible(true, 0.5);
  h.machine.update(0.55);
  h.advance(2000);
  assert.deepEqual(h.played, []);
  h.machine.update(0.75);
  h.advance(2000);
  assert.deepEqual(h.played, ["viewerLeft"]);
});

test("a queued wink is dropped when the stage leaves; cancel restores open eyes", () => {
  const h = harness();
  h.machine.setVisible(true, 0);
  h.machine.update(0.35);
  h.machine.update(0.75);
  h.machine.setVisible(false);
  h.advance(5000);
  assert.deepEqual(h.played, ["viewerRight"]);
  assert.equal(h.resets(), 1, "the in-flight wink was cancelled and the eyes reset");
  assert.equal(h.machine.state.queued, null);
});

test("hidden tab cancels in-flight work and keeps thresholds consumed", () => {
  const h = harness();
  h.machine.setVisible(true, 0);
  h.machine.update(0.35);
  h.machine.cancel();
  h.machine.update(0.36);
  h.advance(3000);
  assert.deepEqual(h.played, ["viewerRight"]);
  assert.equal(h.resets(), 1);
});

test("scene progress maps the stage centre from 85% to 25% of the usable viewport", () => {
  const geometry = { viewportHeight: 1000, headerHeight: 72 };
  const usable = 1000 - 72;
  assert.equal(sceneProgress(72 + PROGRESS_START * usable, geometry), 0);
  assert.equal(sceneProgress(72 + PROGRESS_END * usable, geometry), 1);
  assert.equal(sceneProgress(72 + 0.55 * usable, geometry).toFixed(3), "0.500");
  assert.equal(sceneProgress(5000, geometry), 0);
  assert.equal(sceneProgress(-5000, geometry), 1);
});

test("timeline insets describe the same range as the progress formula", () => {
  const geometry = { viewportHeight: 900, headerHeight: 72 };
  const { top, bottom } = timelineInsets(geometry);
  const usable = 900 - 72;
  // cover 0%: pivot at viewport bottom minus the bottom inset == 85% of the usable area
  assert.equal(900 - bottom, 72 + PROGRESS_START * usable);
  // cover 100%: pivot at the top inset == 25% of the usable area
  assert.equal(top, 72 + PROGRESS_END * usable);
});
