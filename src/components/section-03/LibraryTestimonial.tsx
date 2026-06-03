import { clsx } from "@/lib/clsx";

type Props = {
  className?: string;
};

export function Star({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.6 14.85 8.7l6.65.65-4.95 4.55 1.4 6.55L12 17.1l-5.95 3.35 1.4-6.55L2.5 9.35l6.65-.65L12 2.6Z" />
    </svg>
  );
}

function QuoteWords({ children }: { children: string }) {
  const words = children.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span
          key={`${i}-${w}`}
          data-quote-word
          className="inline-block mr-[0.25em]"
        >
          {w}
        </span>
      ))}
    </>
  );
}

export function LibraryTestimonial({ className }: Props) {
  return (
    <figure
      className={clsx(
        "flex h-full flex-col justify-end",
        className,
      )}
    >
      <div
        data-quote-stars
        className="mb-5 flex items-center gap-[3px] text-white/80"
        role="img"
        aria-label="Rated 5 out of 5"
      >
        <Star size={14} />
        <Star size={14} />
        <Star size={14} />
        <Star size={14} />
        <Star size={14} />
        <span
          aria-hidden="true"
          className="ml-2 t-caps text-white/55"
        >
          5.0
        </span>
      </div>
      <blockquote
        className="t-lead text-white"
      >
        <span data-quote-word className="inline-block text-white/55">
          &ldquo;
        </span>
        <QuoteWords>Every one of the materials in this pack are</QuoteWords>
        <span className="font-semibold text-white">
          <QuoteWords>pristine. Mesmerizing all on their own.</QuoteWords>
        </span>
        <span className="text-white/65">
          <QuoteWords>
            And even more excellent is when it&rsquo;s used as a style reference
            for further prompting and personalizing. Worth every penny.
          </QuoteWords>
        </span>
        <span data-quote-word className="inline-block text-white/55">
          &rdquo;
        </span>
      </blockquote>

      <figcaption
        data-quote-caption
        className="mt-8 flex items-center gap-3 t-caps"
      >
        <span className="h-px w-8 bg-white/35" aria-hidden="true" />
        <span className="text-white/70">MPH Sound</span>
        <span className="text-white/35" aria-hidden="true">
          ·
        </span>
        <span className="text-white/45">Verified Buyer</span>
      </figcaption>
    </figure>
  );
}
