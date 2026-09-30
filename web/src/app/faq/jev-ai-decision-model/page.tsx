import type { Metadata } from "next";
import JevGuide from "./JevGuide";

const title = "Jev AI Decision Model Explained Through Trading | Jev Trader";
const description = "Understand the Jev AI decision model with Jev Trader's free guide to Noul, Choice, Score and parallel evaluation, illustrated through trading examples.";
// Use the established production domain for canonical URLs to keep local preview addresses out of search and sharing metadata.
const canonical = "https://jev-trader.com/faq/jev-ai-decision-model";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }],
    title,
    description,
    url: canonical,
    siteName: "Jev Trader",
    type: "article",
  },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function Page() {
  return <JevGuide />;
}
