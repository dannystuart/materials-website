"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RecipeTile } from "./RecipeTile";
import type { RecipeMaterial } from "./materials";

type Props = {
  material: RecipeMaterial;
  variant?: "desktop" | "mobile";
};

// Two stacked image layers ping-pong between A and B. Whichever layer holds
// the current material gets opacity 1; the other fades to 0. The opposite
// layer is updated with the next material *before* the swap, so when the
// active flips, the new image is already in place and just needs to fade in.
export function RecipeOutput({ material, variant = "desktop" }: Props) {
  const [layerA, setLayerA] = useState<RecipeMaterial>(material);
  const [layerB, setLayerB] = useState<RecipeMaterial>(material);
  const [active, setActive] = useState<"A" | "B">("A");
  const seenIdRef = useRef<string>(material.id);

  useEffect(() => {
    if (material.id === seenIdRef.current) return;
    seenIdRef.current = material.id;
    if (active === "A") {
      setLayerB(material);
      setActive("B");
    } else {
      setLayerA(material);
      setActive("A");
    }
  }, [material, active]);

  const transition = "opacity 0.85s cubic-bezier(0.45, 0, 0.25, 1)";

  return (
    <RecipeTile label="Result" variant={variant} fill align="center">
      <div
        className="relative h-full w-full overflow-hidden rounded-[14px]"
        aria-label={`Result rendered with ${material.name}`}
      >
        <div
          className="absolute inset-0"
          style={{ opacity: active === "A" ? 1 : 0, transition }}
        >
          <Image
            src={layerA.resultImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 340px, 100vw"
            className="object-cover"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{ opacity: active === "B" ? 1 : 0, transition }}
        >
          <Image
            src={layerB.resultImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 340px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </RecipeTile>
  );
}
