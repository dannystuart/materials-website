import { clsx } from "@/lib/clsx";
import { wordsWithVisibleChars } from "./recipeText";
import { RecipeTile } from "./RecipeTile";

type Props = {
  phrase: string;
  typed: string;
  typingDone: boolean;
  variant?: "desktop" | "mobile";
};

export function RecipeInputType({
  phrase,
  typed,
  typingDone,
  variant = "desktop",
}: Props) {
  const fontSize = variant === "desktop" ? 52 : 30;
  const tracking = variant === "desktop" ? "-1.6px" : "-0.9px";
  const rows = wordsWithVisibleChars(phrase, typed.length);
  const lastWithChars = [...rows].reverse().findIndex((r) => r.shown.length > 0);
  const caretRowIdx =
    lastWithChars === -1 ? 0 : rows.length - 1 - lastWithChars;

  return (
    <RecipeTile label="Prompt" variant={variant}>
      <div
        className="font-display font-semibold text-white"
        style={{
          fontSize,
          lineHeight: 1.02,
          letterSpacing: tracking,
        }}
      >
        {rows.map((row, i) => (
          <div key={i} className="whitespace-pre">
            <span>{row.shown}</span>
            {i === caretRowIdx && (
              <span
                className={clsx(
                  "recipe-caret",
                  typingDone && "recipe-caret--done",
                )}
                aria-hidden="true"
              />
            )}
            {row.shown.length === 0 && i !== caretRowIdx && (
              <span className="opacity-0">{row.word}</span>
            )}
          </div>
        ))}
      </div>
    </RecipeTile>
  );
}
