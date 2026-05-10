import { describe, it, expect } from "vitest";
import { HEADLINE_LINES } from "./headlineLines";

describe("HEADLINE_LINES", () => {
  it("has four lines matching Figma", () => {
    expect(HEADLINE_LINES).toHaveLength(4);
  });

  it("flattened plain-text reads naturally", () => {
    const text = HEADLINE_LINES.flat()
      .map((w) => (w.type === "text" ? w.text : "creative"))
      .join(" ");
    expect(text).toBe(
      "Visual ingredients for designers, motion artists, and creative explorers."
    );
  });

  it("the fourth line contains an svg word for 'creative'", () => {
    const line4 = HEADLINE_LINES[3];
    expect(line4.some((w) => w.type === "svg")).toBe(true);
  });
});
