import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { Analytics } from "@/components/consent/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/content/site";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

// latin-ext carries İ ı Ş ş Ğ ğ; latin carries Ö ö Ü ü Ç ç.
const anton = Anton({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Haters Marketing | Meta Reklam Yönetimi, Kreatif ve Strateji Ajansı",
    template: "%s | Haters Marketing",
  },
  description: site.description,
  applicationName: site.name,
  robots: site.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  // From 04-favicon/paste-into-website-head.html
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${anton.variable} ${inter.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
        <a
          href="#icerik"
          className="sr-only-focusable fixed top-3 left-3 z-[70] bg-red px-4 py-3 font-semibold text-ink"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter />
        <CookieConsent />
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
