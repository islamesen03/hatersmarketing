import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { gotoAndSettle, sceneState, scrollToProgress, translateX, translateY, waitForScene } from "./helpers";

test.describe("heart & box", () => {
  test("the balloon rises independently, the box stays put, the string stays attached", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "heart-box", 0);
    await waitForScene(page, "heart-box");
    const at0 = await sceneState(page, "heart-box");
    expect(at0.layers.map((l) => l.name)).toEqual(["box-rear", "balloon", "box-front"]);
    for (const layer of at0.layers) expect(layer.loaded, `${layer.name} loaded`).toBe(true);
    expect(at0.progress).toBeLessThan(0.03);

    const balloon0 = at0.layers.find((l) => l.name === "balloon")!;
    const front0 = at0.layers.find((l) => l.name === "box-front")!;
    const rear0 = at0.layers.find((l) => l.name === "box-rear")!;
    // Low inside the box: the balloon's rect overlaps the front occluder substantially.
    expect(balloon0.rect.bottom).toBeGreaterThan(front0.rect.top + front0.rect.height * 0.45);
    expect(translateY(balloon0.transform)).toBeGreaterThan(balloon0.rect.height * 0.5);
    expect(front0.transform).toBe("none");
    expect(rear0.transform).toBe("none");

    await scrollToProgress(page, "heart-box", 0.5);
    const at50 = await sceneState(page, "heart-box");
    expect(at50.progress).toBeGreaterThan(0.47);
    expect(at50.progress).toBeLessThan(0.53);
    const balloon50 = at50.layers.find((l) => l.name === "balloon")!;
    expect(translateY(balloon50.transform)).toBeLessThan(translateY(balloon0.transform));
    expect(translateY(balloon50.transform)).toBeGreaterThan(0);

    await scrollToProgress(page, "heart-box", 1);
    const at100 = await sceneState(page, "heart-box");
    expect(at100.progress).toBeGreaterThan(0.97);
    const balloon100 = at100.layers.find((l) => l.name === "balloon")!;
    expect(Math.abs(translateY(balloon100.transform))).toBeLessThan(1);
    // The string's bottom (the layer's pivot) sits on the box's near corner F = (320, 455) of 640x660.
    const stage = at100.stageRect;
    const pivotX = balloon100.rect.x + balloon100.rect.width * 0.3985;
    const pivotY = balloon100.rect.y + balloon100.rect.height * 0.98194;
    expect(Math.abs(pivotX - (stage.x + (stage.width * 319) / 640))).toBeLessThan(2.5);
    expect(Math.abs(pivotY - (stage.y + (stage.height * 457) / 660))).toBeLessThan(2.5);
    // The box never moved and the stage kept its size.
    const front100 = at100.layers.find((l) => l.name === "box-front")!;
    expect(front100.rect.height).toBeCloseTo(front0.rect.height, 0);
    expect(at100.stageRect.width).toBeCloseTo(at0.stageRect.width, 0);
    expect(at100.stageRect.height).toBeCloseTo(at0.stageRect.height, 0);

    // Reverse and jump: the pose follows progress exactly, no replay artefacts.
    await scrollToProgress(page, "heart-box", 0.25);
    const back = await sceneState(page, "heart-box");
    expect(translateY(back.layers[1].transform)).toBeGreaterThan(translateY(balloon50.transform));
    await scrollToProgress(page, "heart-box", 1);
    const again = await sceneState(page, "heart-box");
    expect(Math.abs(translateY(again.layers[1].transform))).toBeLessThan(1);
  });

  test("the near walls really occlude the heart (pixel check)", async ({ page }) => {
    await gotoAndSettle(page, "/");
    // p = 0.15: the heart is still low inside the box and the whole stage is on screen.
    await scrollToProgress(page, "heart-box", 0.15);
    await waitForScene(page, "heart-box");
    await page.waitForTimeout(300);
    const state = await sceneState(page, "heart-box");
    const stage = state.stageRect;
    const viewport = page.viewportSize()!;
    // Centre of the near-left wall, well below the rim: must be cardboard grey, not foil red.
    const sample = async (fx: number, fy: number) => {
      const x = Math.round(stage.x + stage.width * fx);
      const y = Math.round(stage.y + stage.height * fy);
      expect(y, "sample point inside the viewport").toBeLessThan(viewport.height - 3);
      const png = await page.screenshot({ clip: { x: x - 2, y: y - 2, width: 5, height: 5 } });
      const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      let r = 0;
      let g = 0;
      let b = 0;
      const n = data.length / 3;
      for (let i = 0; i < data.length; i += 3) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      return { r: r / n, g: g / n, b: b / n };
    };
    const wall = await sample(0.42, 0.78);
    expect(wall.r - Math.max(wall.g, wall.b), "front wall is grey, not red").toBeLessThan(25);
    // The heart does peek out of the opening: the top of its left lobe shows above the rim.
    const stateP0 = await sceneState(page, "heart-box");
    const balloon = stateP0.layers[1];
    const peekX = (balloon.rect.x + balloon.rect.width * 0.27 - stage.x) / stage.width;
    const peekY = (balloon.rect.y + balloon.rect.height * 0.1 - stage.y) / stage.height;
    const peek = await sample(peekX, peekY);
    expect(peek.r - Math.max(peek.g, peek.b), "a hint of red shows above the rim").toBeGreaterThan(40);
  });
});

test.describe("cards", () => {
  test("the red card is dealt out, the top card fans, the stack stays", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await scrollToProgress(page, "cards", 0);
    await waitForScene(page, "cards");
    const at0 = await sceneState(page, "cards");
    expect(at0.layers.map((l) => l.name)).toEqual(["stack-body", "top-card", "red-card"]);
    for (const layer of at0.layers) expect(layer.loaded, `${layer.name} loaded`).toBe(true);
    const red0 = at0.layers.find((l) => l.name === "red-card")!;
    expect(translateX(red0.transform)).toBeGreaterThan(red0.rect.width * 0.08);
    expect(at0.layers[0].transform).toBe("none");

    await scrollToProgress(page, "cards", 1);
    const at100 = await sceneState(page, "cards");
    const red100 = at100.layers.find((l) => l.name === "red-card")!;
    expect(Math.abs(translateX(red100.transform))).toBeLessThan(1);
    expect(Math.abs(translateY(red100.transform))).toBeLessThan(1);
    const top100 = at100.layers.find((l) => l.name === "top-card")!;
    expect(top100.transform).not.toBe("none");
    expect(at100.stageRect.height).toBeCloseTo(at0.stageRect.height, 0);

    await scrollToProgress(page, "cards", 0.4);
    const mid = await sceneState(page, "cards");
    const redMid = mid.layers.find((l) => l.name === "red-card")!;
    expect(translateX(redMid.transform)).toBeGreaterThan(0);
    expect(translateX(redMid.transform)).toBeLessThan(translateX(red0.transform));
  });
});

test.describe("pawns", () => {
  test("six true outlines; the red pawn steps forward and the row holds", async ({ page }) => {
    await gotoAndSettle(page, "/hizmetler/strateji-ve-marka-konumlandirma");
    await scrollToProgress(page, "pawns", 0);
    await waitForScene(page, "pawns");
    const at0 = await sceneState(page, "pawns");
    expect(at0.layers.map((l) => l.name)).toEqual(["pawn-1", "pawn-2", "pawn-3", "pawn-4", "pawn-5", "pawn-red"]);
    for (const layer of at0.layers) expect(layer.loaded, `${layer.name} loaded`).toBe(true);
    // No two pawn boxes overlap more than the trim padding (true outlines, left to right).
    for (let i = 1; i < at0.layers.length; i += 1) {
      expect(at0.layers[i].rect.x).toBeGreaterThan(at0.layers[i - 1].rect.x + at0.layers[i - 1].rect.width * 0.9);
    }
    await scrollToProgress(page, "pawns", 1);
    const at100 = await sceneState(page, "pawns");
    for (let i = 0; i < 5; i += 1) expect(Math.abs(translateY(at100.layers[i].transform))).toBeLessThan(1);
    const red = at100.layers[5];
    expect(translateY(red.transform)).toBeLessThan(-red.rect.height * 0.04);
    expect(translateY(red.transform)).toBeGreaterThan(-red.rect.height * 0.11);
    // Scale ≤ 1.04: the matrix's first entry.
    const scale = Number(red.transform.match(/-?\d+(?:\.\d+)?/g)?.[0] ?? 1);
    expect(scale).toBeLessThanOrEqual(1.041);
    expect(at100.stageRect.height).toBeCloseTo(at0.stageRect.height, 0);
  });
});
