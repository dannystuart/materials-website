import { SectionPitchDesktop } from "./SectionPitchDesktop";
import { SectionPitchMobile } from "./SectionPitchMobile";

export function SectionPitch() {
  return (
    <>
      <div className="hidden md:block">
        <SectionPitchDesktop />
      </div>
      <div className="block md:hidden">
        <SectionPitchMobile />
      </div>
    </>
  );
}
