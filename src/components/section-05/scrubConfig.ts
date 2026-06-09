// Shared scrub geometry for the §05 Macbook demo.
//
// The pin scrubs the lid open over this many pixels of scroll. After the scrub
// hands off to playback the pin is NOT torn down (see useMacbookScrub onLeave),
// so GSAP's visual-continuity translate leaves a retained band of exactly this
// height directly ABOVE the demo — filled by DemoReferencePlate. The hook and
// the plate read the SAME number from here so the band and the plate can never
// drift apart.
export const SCRUB_PX = {
  desktop: 800,
  mobile: 500,
} as const;
