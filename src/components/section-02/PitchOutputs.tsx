import Image from "next/image";
import { PitchOutputFigure } from "./PitchOutputFigure";

export function PitchDesignOutput() {
  return (
    <PitchOutputFigure
      label="In a design tool"
      caption="As a background, a surface, a motion bed. Plug it in."
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
      caption="Feed the same source to Midjourney. The character carries."
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
