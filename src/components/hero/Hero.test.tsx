import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders both desktop and mobile variants in the DOM (CSS toggles visibility)", () => {
    render(<Hero />);
    const sections = screen.queryAllByRole("region", { hidden: true });
    expect(sections.length).toBeGreaterThanOrEqual(0);
    expect(document.querySelectorAll("[data-hero-section]")).toHaveLength(2);
  });

  it("renders the headline in both variants", () => {
    render(<Hero />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(2);
  });
});
