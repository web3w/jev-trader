import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Content from "./Content";
import ReadingLanguage from "../../zh/faq/jev-trading/ReadingLanguage";
import styles from "../../zh/faq/jev-trading/page.module.css";

const title = "How Jev drives trading";
const description = "A guide to the trading workflow, prompt design and Jev API parameters, with diagrams and comments for every field.";
const url = "https://jev-trader.com/faq/jev-trading";

export const metadata: Metadata = {
  title: `${title} | Jev Trader`,
  description,
  alternates: { canonical: url, languages: { en: url, "zh-CN": "https://jev-trader.com/zh/faq/jev-trading", "x-default": url } },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, siteName: "Jev Trader", type: "article", locale: "en_US" },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function Page() {
  const article = {
    "@context": "https://schema.org", "@type": "Article",
    headline: title, description, inLanguage: "en", url,
    mainEntityOfPage: url, isAccessibleForFree: true,
    citation: ["https://docs.typesafe.ai/api", "https://github.com/web3w/jev-trader"],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
    <ReadingLanguage locale="en" />
    <main className={styles.page} lang="en">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label="Article navigation"><Link href="/faq">← All FAQ</Link><a href="/faq/jev-trading" hrefLang="en" lang="en" aria-current="page">English</a><a href="/zh/faq/jev-trading" hrefLang="zh-CN" lang="zh-CN">简体中文</a></nav>
      </header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>FAQ / Trading</p>
        <h1>{title}</h1>
        <p className={styles.subtitle}>From market data to orders</p>
        <nav className={styles.contents} aria-label="Table of contents">
          <ol>
            <li><a href="#workflow">Trading workflow</a></li>
            <li><a href="#interface">API structure</a></li>
            <li><a href="#state">Market data: state</a></li>
            <li><a href="#prompt">Prompt design</a></li>
            <li><a href="#response">Responses and traces</a></li>
            <li><a href="#execution">Following a decision</a></li>
          </ol>
        </nav>
        <Content />
        <p>Try the workflow in the <Link href="/">Jev Trader Hyperliquid demo</Link> or the <Link href="/kuru-mon-usdc">Kuru demo</Link>. Orders and fills shown in these demos are simulated.</p>
        <Link className={styles.back} href="/faq">← Back to FAQ</Link>
      </div>
    </main>
    <SiteFooter locale="en" />
  </>;
}
