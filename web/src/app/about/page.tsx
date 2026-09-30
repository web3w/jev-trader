import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import styles from "../zh/faq/jev-trading/page.module.css";

const title = "About Jev Trader";
const description = "What Jev Trader demonstrates, how model decisions connect to simulated trading, and where this independently maintained project's source code comes from.";
const url = "https://jev-trader.com/about";

export const metadata: Metadata = {
  title: `${title} | Jev Trader`, description,
  alternates: { canonical: url },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, type: "website", locale: "en_US", siteName: "Jev Trader" },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function AboutPage() {
  const schema = { "@context": "https://schema.org", "@type": "AboutPage", name: title, description, url, inLanguage: "en", about: { "@id": "https://jev-trader.com/#application" } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <main className={styles.page} lang="en">
      <header className={styles.header}><a href="/" className={styles.brand}>‖ Jev Trader</a><a href="/">Back to trading</a></header>
      <div className={styles.content}>
        <h1>{title}</h1>
        <article className={styles.article}>
          <p>Jev Trader is an open-source dashboard for exploring public market data, simulated trading and how Jev decisions connect to order execution.</p>
          <section>
            <h2 id="workflow">What you can explore</h2>
            <p>Start with a market, follow a decision and inspect the order and fill feedback. The dashboard brings market inputs, model responses and execution records into one view.</p>
            <ul>
              <li><a href="/">Explore the Hyperliquid HYPE/USDC demo</a></li>
              <li><a href="/kuru-mon-usdc">Open the Kuru MON/USDC demo</a></li>
              <li><a href="/faq/jev-trading">Read the trading workflow guide</a></li>
              <li><a href="/faq">Browse the model guides and tutorials</a></li>
            </ul>
          </section>
          <section>
            <h2 id="simulation">Understanding the displayed results</h2>
            <p>Check the displayed model and execution status: a mock decision is not a Jev inference, and simulated fills are not real trades. Public market data alone does not mean the demonstration is executing live orders.</p>
          </section>
          <section>
            <h2 id="source">Project origins and source code</h2>
            <p>This independently maintained version builds on Jarrod Watts’s original Jev Trader project and adds a Hyperliquid HYPE/USDC demo alongside Kuru MON/USDC.</p>
            <ul>
              <li><a href="https://github.com/web3w/jev-trader">Source for this website · web3w/jev-trader</a></li>
              <li><a href="https://github.com/jarrodwatts/jev-trader">Original project by Jarrod Watts</a></li>
            </ul>
          </section>
        </article>
      </div>
    </main>
    <SiteFooter locale="en" />
  </>;
}
