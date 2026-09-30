import type { Metadata } from "next";
import ProjectSchema from "@/app/ProjectSchema";
import MarketDashboard from "@/app/MarketDashboard";

const title = "Jev Trader — Trading Demo & Project Guide";
const description = "Explore Jev Trader, an independently maintained dashboard based on the original open-source project, with Hyperliquid and Kuru market data, simulated trading and guides.";
// The home page and original pair URL show the same market; use the root URL for search and sharing.
const canonical = "https://jev-trader.com/";

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
    <MarketDashboard key="hyperliquid" venue="hyperliquid" />
  </>;
}
