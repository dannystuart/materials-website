import { FooterDesktop } from "./FooterDesktop";
import { FooterMobile } from "./FooterMobile";

export function Footer() {
  return (
    <>
      <div className="hidden lg:block">
        <FooterDesktop />
      </div>
      <div className="block lg:hidden">
        <FooterMobile />
      </div>
    </>
  );
}
