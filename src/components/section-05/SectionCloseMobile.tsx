import { PackCard } from "./PackCard";
import { CloseTestimonial } from "./CloseTestimonial";
import { MacbookDemo } from "./MacbookDemo";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseMobile() {
  return (
    <section
      className="relative overflow-x-clip bg-hero-bg pb-20 text-white"
      aria-labelledby="close-heading-m"
    >
      <MacbookDemo variant="mobile" />

      <div className="px-6">
        <h2
          id="close-heading-m"
          className="mt-20 text-center font-display text-[40px] font-semibold leading-[1.15] tracking-[-0.025em]"
        >
          Two ways in.
        </h2>

        <div className="mt-12 flex flex-col gap-12">
          <PackCard pack={PAID_PACK} />
          <PackCard pack={FREE_PACK} />
        </div>

        <div className="mt-20">
          <CloseTestimonial />
        </div>
      </div>
    </section>
  );
}
