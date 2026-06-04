export type Word =
  | { type: "text"; text: string }
  | { type: "svg" };

export const HEADLINE_LINES: Word[][] = [
  [{ type: "text", text: "Visual" }, { type: "text", text: "ingredients" }],
  [{ type: "text", text: "for" }, { type: "text", text: "designers," }],
  [
    { type: "text", text: "motion" },
    { type: "text", text: "artists," },
    { type: "text", text: "and" },
  ],
  [{ type: "svg" }, { type: "text", text: "explorers." }],
];

// Mobile centres the headline in a narrow column, so the 3rd/4th lines each
// wrap again internally. Grouping the "creative" gradient word onto the 3rd
// line block keeps "and creative" together (wrapping as one row under "motion
// artists,") and leaves "explorers." alone on the last line — desktop keeps its
// locked break (creative leads the 4th line).
export const HEADLINE_LINES_MOBILE: Word[][] = [
  [{ type: "text", text: "Visual" }, { type: "text", text: "ingredients" }],
  [{ type: "text", text: "for" }, { type: "text", text: "designers," }],
  [
    { type: "text", text: "motion" },
    { type: "text", text: "artists," },
    { type: "text", text: "and" },
    { type: "svg" },
  ],
  [{ type: "text", text: "explorers." }],
];
