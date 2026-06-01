import { FaqItem } from "./FaqItem";
import { FAQ_ENTRIES } from "./faqData";

export function SectionFaqMobile() {
  return (
    <section
      className="relative bg-hero-bg px-6 pb-10 pt-12 text-white"
      aria-labelledby="faq-heading-m"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
        §06 / Honest answers
      </p>
      <h2
        id="faq-heading-m"
        className="mt-5 font-display font-semibold text-white"
        style={{
          fontSize: "32px",
          lineHeight: 1.1,
          letterSpacing: "-0.7px",
        }}
      >
        Three honest worries.
      </h2>
      <p className="mt-4 max-w-[320px] font-display text-[14px] leading-[1.55] text-white/55">
        The questions that come up before people buy — answered straight.
      </p>

      <ul className="mt-10 flex flex-col">
        {FAQ_ENTRIES.map((entry, i) => (
          <li key={entry.id}>
            <FaqItem entry={entry} defaultOpen={i === 0} />
          </li>
        ))}
      </ul>
    </section>
  );
}
