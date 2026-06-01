import { FaqItem } from "./FaqItem";
import { FAQ_ENTRIES } from "./faqData";

export function SectionFaqDesktop() {
  return (
    <section
      className="relative bg-hero-bg pb-16 pt-24 text-white"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto w-full max-w-[1440px] px-12 min-[1600px]:px-[8vw] min-[2200px]:px-[12vw]">
        <div className="grid grid-cols-12 gap-x-10">
          <div className="col-span-4 col-start-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              §06 / Honest answers
            </p>
            <h2
              id="faq-heading"
              className="mt-6 font-display font-semibold text-white"
              style={{
                fontSize: "44px",
                lineHeight: 1.08,
                letterSpacing: "-1.3px",
              }}
            >
              Three honest worries.
            </h2>
            <p
              className="mt-5 max-w-[320px] font-display text-[15px] leading-[1.55] text-white/55"
            >
              The questions that come up before people buy — answered straight.
            </p>
          </div>

          <div className="col-span-7 col-start-6">
            <ul className="flex flex-col">
              {FAQ_ENTRIES.map((entry, i) => (
                <li key={entry.id}>
                  <FaqItem entry={entry} defaultOpen={i === 0} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
