import type { Metadata } from "next";
import MarketDashboard from "@/app/MarketDashboard";

const title = "HYPE/USDC: Jev AI Trading Case Study | Jev Trader";
const description = "Try Jev Trader free: explore the Jev AI decision model through live Hyperliquid HYPE/USDC data, paper trading, order placement and fill feedback.";
// The home page and original pair URL show the same market; use the root URL for search and sharing.
const canonical = "https://jev-trader.com/";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "Jev Trader",
    type: "website",
  },
  twitter: { card: "summary", title, description },
};

export default function Page() {
  return <MarketDashboard key="hyperliquid" venue="hyperliquid" />;
}
