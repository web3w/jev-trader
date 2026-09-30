import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jev AI Decision Model Trading Case Study | Jev Trader",
  description: "Explore Jev Trader free through live market data and paper-trading examples. Learn how the Jev AI decision model connects market inputs with execution.",
  keywords: ["Jev trader free", "Jev Trader", "Jev AI decision model", "paper trading"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F0EEE9",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const language = (await headers()).get("x-page-language") ?? "en";
  return (
    <html lang={language} className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        {children}
        {/* Load the shared Google Ads tag once after hydration. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18465988236"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18465988236');
          `}
        </Script>
      </body>
    </html>
  );
}
