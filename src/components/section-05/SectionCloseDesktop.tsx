import { PackCard } from "./PackCard";
import { CloseTestimonial } from "./CloseTestimonial";
import { MacbookDemo } from "./MacbookDemo";
import { PAID_PACK, FREE_PACK } from "./packData";

export function SectionCloseDesktop() {
  return (
    <section
      className="relative overflow-x-clip bg-hero-bg pt-32 pb-20 text-white"
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

      <div className="mt-24 flex justify-center">
        <div className="relative isolate flex gap-20">
          {/* One soft ambient glow behind the whole pricing-card cluster — an
              atmospheric backdrop so the section reads as a lit field, not
              cards floating on pure black. Cool/blue per the page's atmosphere
              (the hero's bottom blue); warmth stays in the cards' own blooms.
              Sits behind the cards and their halo rings (-z-10). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 -top-40 -z-10 h-[104%] w-[1720px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(60% 54% at 50% 32%, rgba(96,142,224,0.26) 0%, rgba(96,142,224,0.11) 44%, transparent 74%)",
              filter: "blur(56px)",
            }}
          />

          <div className="w-[440px] self-start">
            <PackCard pack={PAID_PACK} />
          </div>
          <div className="w-[440px] self-start">
            <PackCard pack={FREE_PACK} />
          </div>
        </div>
      </div>

      <div className="mt-32 px-12 min-[1600px]:px-[12vw] min-[2200px]:px-[20vw]">
        <CloseTestimonial />
      </div>
    </section>
  );
}
