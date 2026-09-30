import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { languages, type Locale } from "@/lib/i18n";
import { copy, toolPaths, toolUrls, referenceUrl } from "./content";
import MarketTool from "./MarketTool";
import styles from "./page.module.css";
import { articlePaths, articleTitles } from "@/app/faq/jev-polymarket/routes";

export function toolMetadata(locale: Locale): Metadata {
  const c = copy[locale], url = toolUrls[locale];
  return {
    title: `${c.title} | Jev Trader`, description: c.intro,
    alternates: { canonical: url, languages: { ...toolUrls, "x-default": toolUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title: c.title, description: c.intro, url, siteName: "Jev Trader", type: "website", locale: { en: "en_US", "zh-CN": "zh_CN", ko: "ko_KR" }[locale] },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title: c.title, description: c.intro },
  };
}

export default function ToolPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const scorePath = `${locale === "en" ? "" : locale === "zh-CN" ? "/zh" : "/ko"}/faq/jev-score`;
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: c.shortTitle, description: c.intro, url: toolUrls[locale], inLanguage: locale, applicationCategory: "FinanceApplication", operatingSystem: "Web browser" };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <main className={styles.page} lang={locale}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label={c.language}>{languages.map(({ code, label }) => <a key={code} href={toolPaths[code]} hrefLang={code} lang={code} aria-current={code === locale ? "page" : undefined}>{label}</a>)}</nav>
      </header>
      <div className={styles.hero}>
        <Link className={styles.back} href="/">← {c.back}</Link>
        <h1>{c.shortTitle}</h1><p className={styles.tagline}>{c.tagline}</p><p>{c.intro}</p>
        <p className={styles.badge}>{c.status}</p>
      </div>
      <MarketTool key={locale} locale={locale} />
      <section className={styles.guide} id="how-to-use"><h2>{c.guide}</h2><ol>{c.steps.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol></section>
      <nav className={styles.resources} aria-label={c.sources}>
        <a href={articlePaths[locale]}>{articleTitles[locale]}</a>
        <a href={referenceUrl}>{c.reference}</a>
        <Link href={scorePath}>{c.scoreGuide}</Link>
        <a href="https://docs.typesafe.ai/primitives" hrefLang="en">Jev / TypeSafe</a>
        <a href="https://help.polymarket.com/en/articles/13364488-how-are-prices-calculated" hrefLang="en">{c.priceGuide}</a>
        <a href="https://help.polymarket.com/en/articles/13364444-limit-orders" hrefLang="en">{c.orderGuide}</a>
      </nav>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
