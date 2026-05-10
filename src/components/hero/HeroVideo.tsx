import { forwardRef } from "react";

type Props = {
  variant: "desktop" | "mobile";
};

export const HeroVideo = forwardRef<HTMLVideoElement, Props>(function HeroVideo(
  { variant },
  ref,
) {
  const preload = variant === "desktop" ? "auto" : "metadata";

  return (
    <video
      ref={ref}
      className="hero-video w-full h-auto"
      muted
      playsInline
      preload={preload}
      poster="/videos/materials-hero-poster.jpg"
      role="presentation"
      aria-hidden="true"
      data-hero-video
    >
      {variant === "desktop" ? (
        <>
          <source src="/videos/materials-hero.webm" type="video/webm" />
          <source src="/videos/materials-hero.mp4" type="video/mp4" />
        </>
      ) : (
        <>
          <source src="/videos/materials-hero-720.webm" type="video/webm" />
          <source src="/videos/materials-hero-720.mp4" type="video/mp4" />
        </>
      )}
    </video>
  );
});
