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
      // aspect-square reserves the box before poster/metadata decode (both the
      // 720 cut and its poster are 720×720). Without it the element falls back
      // to the replaced-element default 2:1 whenever intrinsic-size info isn't
      // available yet, breathing ~±170px of document height under everything
      // below — which left §05's ScrollTrigger zone permanently stale on iOS
      // when the trigger was created mid-dip. Desktop sizes by height (85vh,
      // w-auto) inside an absolute container, so it can't shift the document.
      className={`hero-video w-full h-auto${isMobile ? " aspect-square" : ""}`}
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
