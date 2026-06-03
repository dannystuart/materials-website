import { FaqItem } from "./FaqItem";
import { FAQ_ENTRIES } from "./faqData";

export function SectionFaqDesktop() {
  return (
    <section
      className="relative bg-hero-bg pb-16 pt-24 text-white"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto w-full max-w-[1440px] px-12 wide:px-[8vw] ultra:px-[12vw]">
        <div className="grid grid-cols-12 gap-x-10">
          <div className="col-span-4 col-start-1">
            <p className="t-caps text-white/45">
              §06 / Honest answers
            </p>
            <h2
              id="faq-heading"
              className="mt-6 t-h2 text-white"
            >
              Three honest worries.
            </h2>
            <p className="mt-5 max-w-[320px] t-caption text-white/55">
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
