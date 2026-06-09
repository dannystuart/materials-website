import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// Default the reduced-motion hook to false; individual tests override.
const reducedMock = vi.fn(() => false);
vi.mock("../hero/useReducedMotion", () => ({
  useReducedMotion: () => reducedMock(),
}));
// Stub the scrub hook — Task 1 is markup only; motion is browser-verified.
vi.mock("./useMacbookScrub", () => ({ useMacbookScrub: () => {} }));

import { MacbookDemo } from "./MacbookDemo";

describe("MacbookDemo caption", () => {
  it("renders the eyebrow and each display word as its own span", () => {
    reducedMock.mockReturnValue(false);
    const { container } = render(<MacbookDemo variant="desktop" />);
    const caption = container.querySelector("[data-demo-caption]");
    expect(caption).not.toBeNull();
    expect(
      container.querySelector("[data-demo-caption-eyebrow]")?.textContent,
    ).toBe("APPLIED");
    const words = container.querySelectorAll("[data-demo-caption-word]");
    expect([...words].map((w) => w.textContent)).toEqual([
      "A",
      "few",
      "Materials,",
      "on",
      "real",
      "work.",
    ]);
  });

  it("never marks the caption with data-reveal (would be hidden by global CSS)", () => {
    reducedMock.mockReturnValue(false);
    const { container } = render(<MacbookDemo variant="desktop" />);
    const caption = container.querySelector("[data-demo-caption]");
    expect(caption?.querySelector("[data-reveal]")).toBeNull();
    expect(caption?.hasAttribute("data-reveal")).toBe(false);
  });

  it("flags motion vs static layout via the data-demo-caption value", () => {
    reducedMock.mockReturnValue(false);
    const motion = render(<MacbookDemo variant="desktop" />);
    expect(
      motion.container
        .querySelector("[data-demo-caption]")
        ?.getAttribute("data-demo-caption"),
    ).toBe("motion");

    reducedMock.mockReturnValue(true);
    const stat = render(<MacbookDemo variant="desktop" />);
    expect(
      stat.container
        .querySelector("[data-demo-caption]")
        ?.getAttribute("data-demo-caption"),
    ).toBe("static");
  });

  it("wraps the sticky demo block in a travel wrapper sized from SCRUB_PX", () => {
    reducedMock.mockReturnValue(false);
    for (const [variant, px] of [
      ["mobile", "500px"],
      ["desktop", "800px"],
    ] as const) {
      const { container } = render(<MacbookDemo variant={variant} />);
      const travel = container.querySelector<HTMLElement>(
        "[data-macbook-travel]",
      );
      const block = container.querySelector<HTMLElement>(
        "[data-macbook-demo]",
      );
      const spacer = container.querySelector<HTMLElement>(
        "[data-macbook-travel-spacer]",
      );
      expect(travel).not.toBeNull();
      expect(block).not.toBeNull();
      expect(spacer).not.toBeNull();
      // The block must sit INSIDE the travel wrapper and be the sticky one —
      // the wrapper provides the permanent scrub travel (constant document
      // height; no pin-spacer to tear down at the handoff).
      expect(travel!.contains(block!)).toBe(true);
      expect(travel!.style.getPropertyValue("--scrub-travel")).toBe(px);
      expect(block!.className).toContain("sticky");
      // The travel MUST be a real spacer child, not wrapper padding — sticky
      // is constrained to the parent's CONTENT box, so padding gives the block
      // zero travel room and it never sticks.
      expect(travel!.className).not.toContain("pb-(--scrub-travel)");
      expect(travel!.contains(spacer!)).toBe(true);
      expect(spacer!.className).toContain("motion-safe:h-(--scrub-travel)");
      // Spacer must come AFTER the sticky block (travel below, not above).
      const kids = [...travel!.children];
      expect(kids.indexOf(spacer!)).toBeGreaterThan(kids.indexOf(block!));
    }
  });

  it("renders the caption as a sibling above the video frame, not inside it", () => {
    reducedMock.mockReturnValue(false);
    const { container } = render(<MacbookDemo variant="desktop" />);
    const block = container.querySelector("[data-macbook-demo]");
    const caption = container.querySelector("[data-demo-caption]");
    const frame = block?.querySelector("video")?.closest(".overflow-hidden");
    expect(caption).not.toBeNull();
    expect(frame).not.toBeNull();
    // caption must NOT be nested inside the video frame
    expect(frame?.contains(caption!)).toBe(false);
    // caption must be a direct child of the block, before the video frame
    expect(caption?.parentElement).toBe(block);
    const kids = [...(block?.children ?? [])];
    expect(kids.indexOf(caption!)).toBeLessThan(kids.indexOf(frame!));
  });
});
