import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { languages, type Locale } from "@/lib/i18n";
import { copy, example, toolPaths, toolUrls } from "./content";
import TradingTool from "./TradingTool";
import styles from "./page.module.css";

export function toolMetadata(locale: Locale): Metadata {
  const title = "Ask Jev Trading | Jev Trader", description = copy[locale].intro, url = toolUrls[locale];
  return {
    title, description,
    alternates: { canonical: url, languages: { ...toolUrls, "x-default": toolUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, siteName: "Jev Trader", type: "website", locale: { en: "en_US", "zh-CN": "zh_CN", ko: "ko_KR" }[locale] },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
  };
}
export default function ToolPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const scorePath = locale === "en" ? "/faq/jev-score" : locale === "zh-CN" ? "/zh/faq/jev-score" : "/ko/faq/jev-score";
  return <>
    <main className={styles.page} lang={locale}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label={c.language}>{languages.map(({ code, label }) => <Link key={code} href={toolPaths[code]} hrefLang={code} lang={code} aria-current={locale === code ? "page" : undefined}>{label}</Link>)}</nav>
      </header>
      <div className={styles.hero}>
        <Link className={styles.back} href="/">← {c.back}</Link>
        <h1>Ask Jev Trading</h1>
        <p>{c.intro}</p>
      </div>
      <TradingTool locale={locale} />
      <section className={styles.guide} id="how-to-use">
        <h2>{c.guide}</h2>
        <ol>{c.steps.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol>
      </section>
      <section className={styles.examples}>
        <h2>{c.exampleTitle}</h2>
        <div>{(["noul", "choice", "score"] as const).map((type) => <article key={type}><h3>{c.types[type]}</h3><p>{example(locale, type).question}</p></article>)}</div>
      </section>
      <nav className={styles.resources} aria-label={c.sources}>
        <Link href={scorePath}>{c.faq}</Link><a href="https://docs.typesafe.ai/primitives" hrefLang="en">TypeSafe API</a><Link href="/privacy-policy" hrefLang="en">{c.privacy}</Link>
      </nav>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
