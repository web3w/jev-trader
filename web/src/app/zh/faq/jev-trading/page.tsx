import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import Content from "./Content";
import ReadingLanguage from "./ReadingLanguage";
import styles from "./page.module.css";

const title = "Jev 如何驱动交易：从行情到订单";
const description = "通过流程图了解交易业务流程、Prompt 设计，以及带逐字段中文注释的 Jev 请求和返回参数。";
const url = "https://jev-trader.com/zh/faq/jev-trading";

export const metadata: Metadata = {
  title: `${title} | Jev Trader`,
  description,
  alternates: { canonical: url, languages: { en: "https://jev-trader.com/faq/jev-trading", "zh-CN": url, "x-default": "https://jev-trader.com/faq/jev-trading" } },
  openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, siteName: "Jev Trader", type: "article", locale: "zh_CN" },
  twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
};

export default function Page() {
  const article = {
    "@context": "https://schema.org", "@type": "Article",
    headline: title, description, inLanguage: "zh-CN", url,
    mainEntityOfPage: url, isAccessibleForFree: true,
    citation: ["https://docs.typesafe.ai/api", "https://github.com/web3w/jev-trader"],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
    <ReadingLanguage />
    <main className={styles.page} lang="zh-CN">
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label="文章导航"><Link href="/zh/faq">← 全部 FAQ</Link><a href="/faq/jev-trading" hrefLang="en" lang="en">English</a><a href="/zh/faq/jev-trading" hrefLang="zh-CN" lang="zh-CN" aria-current="page">简体中文</a></nav>
      </header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>FAQ / Trading</p>
        <h1>{title}</h1>
        <nav className={styles.contents} aria-label="文章目录">
          <ol>
            <li><a href="#workflow">业务流程</a></li>
            <li><a href="#interface">接口结构</a></li>
            <li><a href="#state">行情参数 state</a></li>
            <li><a href="#prompt">Prompt 设计</a></li>
            <li><a href="#response">返回值与调用记录</a></li>
            <li><a href="#execution">一次判断如何执行</a></li>
          </ol>
        </nav>
        <Content />
        <Link className={styles.back} href="/zh/faq">← 返回 FAQ，继续阅读</Link>
      </div>
    </main>
    <SiteFooter locale="zh-CN" />
  </>;
}
