import { forwardRef } from "react";

type Props = {
  variant: "desktop" | "mobile";
};

export const HeroVideo = forwardRef<HTMLVideoElement, Props>(function HeroVideo(
  { variant },
  ref,
) {
  const isMobile = variant === "mobile";

  return (
    <video
      ref={ref}
      className="hero-video w-full h-auto"
      muted
      playsInline
      preload="auto"
      autoPlay={isMobile}
      loop={isMobile}
      poster={
        isMobile
          ? "/videos/materials-hero-720-poster.jpg"
          : "/videos/materials-hero-poster.jpg"
      }
      role="presentation"
      aria-hidden="true"
      data-hero-video
    >
      {!isMobile ? (
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
