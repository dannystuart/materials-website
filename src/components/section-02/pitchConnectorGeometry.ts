/**
 * Pure geometry helpers for the §02 mobile swipe-tracked connector lines.
 *
 * Kept in their own module (no React / no Three) so the brightness mapping can
 * be unit-tested in isolation — importing the carousel component would drag in
 * the WebGL orbit ring and its `three` dependency.
 */

/** Connector opacity when its card sits dead-centre in the viewport. */
export const CENTERED_OPACITY = 1.0;
/** Connector opacity when its card is fully off to the side. */
export const OFFSCREEN_OPACITY = 0.35;

/**
 * Map how far a card's centre is from the carousel's visual centre to the
 * brightness of that card's connector line.
 *
 * - distance 0 (card centred) → {@link CENTERED_OPACITY}
 * - distance ≥ halfWidth (card a full half-viewport away / off-screen) →
 *   {@link OFFSCREEN_OPACITY}
 * - linear in between, clamped to that range.
 *
 * @param distancePx  |cardCentreX − trackVisualCentreX| in CSS pixels (sign
 *                    doesn't matter — pass the absolute value or not).
 * @param halfWidthPx half the visible track width in CSS pixels; the distance
 *                    at which a line reaches its dimmest. Non-positive values
 *                    fall back to the centred opacity (avoids divide-by-zero
 *                    before the track has been measured).
 */
export function centerProximityToOpacity(
  distancePx: number,
  halfWidthPx: number,
): number {
  if (!(halfWidthPx > 0)) return CENTERED_OPACITY;
  const t = Math.min(1, Math.max(0, Math.abs(distancePx) / halfWidthPx));
  return CENTERED_OPACITY + t * (OFFSCREEN_OPACITY - CENTERED_OPACITY);
}
