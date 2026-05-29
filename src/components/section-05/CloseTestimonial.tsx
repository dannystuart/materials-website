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
          className="ml-2 font-display font-medium uppercase tracking-[0.22em] text-white/55"
          style={{ fontSize: "12px" }}
        >
          5.0
        </span>
      </div>

      <blockquote
        className="font-display text-white"
        style={{
          fontSize: "26px",
          lineHeight: 1.35,
          letterSpacing: "-0.4px",
          fontWeight: 400,
        }}
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
        className="mt-8 flex items-center justify-center gap-3 font-display"
        style={{ fontSize: "11px" }}
      >
        <span className="h-px w-8 bg-white/35" aria-hidden="true" />
        <span className="font-medium uppercase tracking-[0.22em] text-white/70">
          Eric Kerr
        </span>
        <span className="text-white/35" aria-hidden="true">
          ·
        </span>
        <span className="font-medium uppercase tracking-[0.22em] text-white/45">
          Verified Buyer
        </span>
        <span className="h-px w-8 bg-white/35" aria-hidden="true" />
      </figcaption>
    </figure>
  );
}
