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
