import Image from "next/image";
import { PitchOutputFigure } from "./PitchOutputFigure";

export function PitchDesignOutput() {
  return (
    <PitchOutputFigure
      label="Design asset"
      caption="As a background, visual element, scroll driven animations. Plug it in quickly."
    >
      <Image
        src="/example-2.png"
        alt="A landing-page mock using the Material as a hero surface"
        fill
        sizes="(min-width: 1024px) 320px, 80vw"
        className="object-cover"
      />
    </PitchOutputFigure>
  );
}

export function PitchAIOutput() {
  return (
    <PitchOutputFigure
      label="As a style reference"
      caption="Feed as a reference in any generative AI tool. Works especially well in Midjourney."
      imageScale={1.5}
    >
      <Image
        src="/example-1.png"
        alt="An AI-generated composition that inherits the Material's character"
        fill
        sizes="(min-width: 1024px) 320px, 80vw"
        className="object-cover"
      />
    </PitchOutputFigure>
  );
}
