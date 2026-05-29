import { PackCard } from "./PackCard";
import { CloseTestimonial } from "./CloseTestimonial";
import { MacbookDemo } from "./MacbookDemo";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseDesktop() {
  return (
    <section
      className="relative overflow-x-clip bg-hero-bg pb-20 text-white"
      aria-labelledby="close-heading"
    >
      <MacbookDemo variant="desktop" />

      <div className="mt-32 px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
        <h2
          id="close-heading"
          className="text-center font-display text-[56px] font-semibold leading-[1.15] tracking-[-0.0334em]"
        >
          Two ways in.
        </h2>
      </div>

      <div className="mt-24 flex justify-center gap-20">
        <div className="w-[440px] self-start">
          <PackCard pack={PAID_PACK} />
        </div>
        <div className="w-[440px] self-start">
          <PackCard pack={FREE_PACK} />
        </div>
      </div>

      <div className="mt-32 px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
        <CloseTestimonial />
      </div>
    </section>
  );
}
