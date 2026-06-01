import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Materials",
};

const scrollRestorationScript = `(function(){try{if('scrollRestoration' in history)history.scrollRestoration='manual';var y=sessionStorage.getItem('materials-scroll-y');if(y&&Number(y)>0)document.documentElement.classList.add('scroll-restoring');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scrollRestorationScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
