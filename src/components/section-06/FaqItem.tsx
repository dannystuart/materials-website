import type { FaqEntry } from "./faqData";

type Props = {
  entry: FaqEntry;
  defaultOpen?: boolean;
};

export function FaqItem({ entry, defaultOpen = false }: Props) {
  return (
    <details
      className="faq-item group border-t border-white/[0.08] last:border-b last:border-b-white/[0.08]"
      open={defaultOpen}
    >
      <summary
        className="cta-focus-ring relative flex cursor-pointer list-none items-baseline gap-6 py-7 transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none sm:gap-8"
        aria-controls={`faq-${entry.id}-body`}
      >
        <span
          aria-hidden="true"
          className="hidden shrink-0 font-display text-[11px] font-medium uppercase tracking-[0.22em] text-white/40 transition-colors duration-200 ease-out group-open:text-white/70 sm:inline-block sm:w-12"
        >
          {entry.number}
        </span>

        <span
          className="flex-1 font-display text-[20px] font-medium leading-snug tracking-[-0.005em] text-white/80 transition-colors duration-200 ease-out group-hover:text-white group-open:text-white sm:text-[22px]"
        >
          {entry.question}
        </span>

        <span
          aria-hidden="true"
          className="faq-icon relative ml-2 flex h-5 w-5 shrink-0 items-center justify-center text-white/55 transition-all duration-300 ease-out group-hover:text-white/85 group-open:rotate-45 group-open:text-white motion-reduce:transition-none"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
        </span>
      </summary>

      <div
        id={`faq-${entry.id}-body`}
        className="faq-body grid grid-cols-1 pb-8 sm:grid-cols-[3rem_1fr_2rem] sm:gap-x-8"
      >
        <div aria-hidden="true" className="hidden sm:block" />
        <p
          className="max-w-[640px] font-display text-[17px] leading-[1.6] text-white/70 sm:text-[18px]"
        >
          {entry.answer}
        </p>
        <div aria-hidden="true" className="hidden sm:block" />
      </div>
    </details>
  );
}
