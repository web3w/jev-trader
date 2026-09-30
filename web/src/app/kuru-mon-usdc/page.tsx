import type { Metadata } from "next";
import ProjectSchema from "@/app/ProjectSchema";
import MarketDashboard from "@/app/MarketDashboard";

const title = "Jev Trader — Kuru MON/USDC Trading Demo";
const description = "Explore the Jev AI decision model with Jev Trader's free Kuru MON/USDC paper-trading demo, using live Monad data, order placement and fill feedback.";
// Use the production domain for canonical URLs to avoid local preview links in search and sharing metadata.
const canonical = "https://jev-trader.com/kuru-mon-usdc";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }],
    title,
    description,
    url: canonical,
    siteName: "Jev Trader",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function Page() {
  return <>
    <ProjectSchema />
    <MarketDashboard key="kuru" venue="kuru" />
  </>;
}
