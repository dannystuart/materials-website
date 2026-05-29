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
});
