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
          className="mt-20 text-center t-display"
        >
          Two ways in.
        </h2>

        {/* Each card stacks vertically on mobile, so the desktop cluster glow
            would only light the top one — give each card its own blue top
            glow (the page atmosphere lighting the card from above, per
            --atmosphere-blue-close). isolate keeps the -z-10 glow above the
            section's near-black bg. */}
        <div className="mt-12 flex flex-col gap-12">
          {[PAID_PACK, FREE_PACK].map((pack) => (
            <div key={pack.variant} className="relative isolate">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-14 left-1/2 -z-10 h-[58%] w-[120%] -translate-x-1/2"
                style={{
                  // rgba(var(),α): the token is comma-separated, so the slash
                  // form rgb(var()/α) would be invalid CSS and drop the colour.
                  background:
                    "radial-gradient(80% 70% at 50% 0%, rgba(var(--atmosphere-blue-close), 0.4) 0%, rgba(var(--atmosphere-blue-close), 0.16) 42%, transparent 72%)",
                  filter: "blur(44px)",
                }}
              />
              <PackCard pack={pack} />
            </div>
          ))}
        </div>

        <div className="mt-20">
          <CloseTestimonial />
        </div>
      </div>
    </section>
  );
}
