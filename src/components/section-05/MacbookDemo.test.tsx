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
