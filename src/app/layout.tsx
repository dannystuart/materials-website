import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

const pageTitle = "Materials¹ — a library of abstract design textures";
const pageDescription = SITE_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: pageTitle,
    template: "%s · Vanta Supply",
  },
  description: pageDescription,
  applicationName: SITE_NAME,
  authors: [{ name: "Danny Stuart", url: "https://dannystuart.com" }],
  creator: "Danny Stuart",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: pageTitle,
    description: pageDescription,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#010100",
  colorScheme: "dark",
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
      <body className="min-h-full">
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#010100] shadow-lg focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(83,149,237,0.9)]"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
