import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FloatingCta } from "./FloatingCta";

describe("FloatingCta", () => {
  it("renders the label and the buy link", () => {
    render(<FloatingCta />);
    expect(screen.getByText(/Materials/)).toBeTruthy();
    const link = screen.getByRole("link", { name: /Buy/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("#buy");
  });

  it("exposes a nav landmark labelled Buy", () => {
    render(<FloatingCta />);
    expect(screen.getByRole("navigation", { name: /Buy/i })).toBeTruthy();
  });
});
