import { describe, it, expect } from "vitest";
import {
  centerProximityToOpacity,
  CENTERED_OPACITY,
  OFFSCREEN_OPACITY,
} from "./pitchConnectorGeometry";

describe("centerProximityToOpacity", () => {
  it("is fully bright when the card is centred (distance 0)", () => {
    expect(centerProximityToOpacity(0, 160)).toBe(CENTERED_OPACITY);
  });

  it("is dimmest when the card is a full half-width away", () => {
    expect(centerProximityToOpacity(160, 160)).toBeCloseTo(OFFSCREEN_OPACITY);
  });

  it("interpolates linearly at the halfway point", () => {
    const mid = (CENTERED_OPACITY + OFFSCREEN_OPACITY) / 2;
    expect(centerProximityToOpacity(80, 160)).toBeCloseTo(mid);
  });

  it("clamps beyond the half-width to the dim floor (no over-darkening)", () => {
    expect(centerProximityToOpacity(1000, 160)).toBeCloseTo(OFFSCREEN_OPACITY);
  });

  it("treats negative distances symmetrically", () => {
    expect(centerProximityToOpacity(-80, 160)).toBeCloseTo(
      centerProximityToOpacity(80, 160),
    );
  });

  it("falls back to centred opacity before the track is measured (halfWidth ≤ 0)", () => {
    expect(centerProximityToOpacity(50, 0)).toBe(CENTERED_OPACITY);
    expect(centerProximityToOpacity(50, -10)).toBe(CENTERED_OPACITY);
  });
});
