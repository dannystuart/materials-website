import { HEADLINE_LINES, type Word } from "./headlineLines";
import { CreativeWord } from "./icons/CreativeWord";

export function HeroHeadline({ lines = HEADLINE_LINES }: { lines?: Word[][] }) {
  return (
    <h1
      className="hero-headline font-display font-semibold text-white max-w-[595px]"
      data-hero-headline
    >
      {lines.map((line, lineIdx) => (
        <span className="block" data-hero-headline-line={lineIdx} key={lineIdx}>
          {line.map((word, wordIdx) =>
            word.type === "svg" ? (
              <span
                key={wordIdx}
                className="hero-word inline-block align-baseline"
                data-hero-word
              >
                <CreativeWord className="align-baseline" />
              </span>
            ) : (
              <span
                key={wordIdx}
                className="hero-word inline-block mr-[0.25em]"
                data-hero-word
              >
                {word.text}
              </span>
            )
          )}
        </span>
      ))}
    </h1>
  );
}
