import { clsx } from "@/lib/clsx";
import { Star } from "@/components/section-03/LibraryTestimonial";

type Props = {
  className?: string;
};

export function CloseTestimonial({ className }: Props) {
  return (
    <figure className={clsx("mx-auto max-w-[720px] text-center", className)}>
      <div
        className="mb-6 flex items-center justify-center gap-[3px] text-white/80"
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
        <span className="text-white/55">&ldquo;</span>
        <span className="font-semibold text-white">
          Stunning and thoughtfully curated
        </span>{" "}
        <span className="text-white/65">
          collection of visuals. Excited to incorporate them into a variety of
          client projects.
        </span>
        <span className="text-white/55">&rdquo;</span>
      </blockquote>

      <figcaption
        className="mt-8 flex items-center justify-center gap-3 t-caps"
      >
        <span className="hidden h-px w-8 bg-white/35 md:block" aria-hidden="true" />
        <span className="whitespace-nowrap text-white/70">Eric Kerr</span>
        <span className="text-white/35" aria-hidden="true">
          ·
        </span>
        <span className="whitespace-nowrap text-white/45">Verified Buyer</span>
        <span className="hidden h-px w-8 bg-white/35 md:block" aria-hidden="true" />
      </figcaption>
    </figure>
  );
}
