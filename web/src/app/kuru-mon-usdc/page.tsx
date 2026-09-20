import type { Metadata } from "next";
import MarketDashboard from "@/app/MarketDashboard";

const title = "MON/USDC: Jev AI Trading Case Study | Jev Trader";
const description = "Explore the Jev AI decision model with Jev Trader's free Kuru MON/USDC paper-trading demo, using live Monad data, order placement and fill feedback.";
// Use the production domain for canonical URLs to avoid local preview links in search and sharing metadata.
const canonical = "https://jev-trader.com/kuru-mon-usdc";

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
  return <MarketDashboard key="kuru" venue="kuru" />;
}
