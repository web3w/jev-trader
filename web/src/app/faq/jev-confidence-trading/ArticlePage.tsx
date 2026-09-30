import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { articleContent } from "./content";
import { articlePaths, articleUrls, articleTitles, articleDescriptions, type ArticleLocale } from "./routes";
import styles from "../../zh/faq/jev-trading/page.module.css";

const citations = ["https://docs.typesafe.ai/primitives/choice", "https://docs.typesafe.ai/confidence", "https://docs.typesafe.ai/api#answer-types", "https://scikit-learn.org/stable/modules/calibration.html#calibration-curves", "https://scikit-learn.org/stable/modules/generated/sklearn.metrics.brier_score_loss.html", "https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html", "https://github.com/jarrodwatts/jev-trader"];
export function articleMetadata(locale: ArticleLocale): Metadata {
  const title = articleTitles[locale], description = articleDescriptions[locale], url = articleUrls[locale];
  return {
    title: `${title} | Jev Trader`, description,
    alternates: { canonical: url, languages: { ...articleUrls, "x-default": articleUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader" }], title, description, url, type: "article", locale: locale === "en" ? "en_US" : "zh_CN" },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
  };
}
export default function ArticlePage({ locale }: { locale: ArticleLocale }) {
  const content = articleContent[locale];
  const labels = locale === "en" ? ["Back to FAQ", "Contents", "Language"] : ["返回 FAQ", "目录", "语言"];
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: articleTitles[locale], description: articleDescriptions[locale], url: articleUrls[locale], inLanguage: locale, citation: citations };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <main className={styles.page} lang={locale}>
      <header className={styles.header}><a href="/" className={styles.brand}>‖ Jev Trader</a>
        <nav aria-label={labels[2]}>{(["en", "zh-CN"] as const).map(code => <a key={code} href={articlePaths[code]} hrefLang={code} lang={code} aria-current={code === locale ? "page" : undefined}>{code === "en" ? "English" : "简体中文"}</a>)}</nav>
      </header>
      <div className={styles.content}>
        <a className={styles.back} href={locale === "en" ? "/faq" : "/zh/faq"}>← {labels[0]}</a>
        <h1>{articleTitles[locale]}</h1>
        <nav className={styles.contents} aria-label={labels[1]}><ol>{content.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\. /, "")}</a></li>)}</ol></nav>
        <article className={styles.article}>{content.introduction}{content.sections.map(section => <section key={section.id}><h2 id={section.id}>{section.title}</h2>{section.body}</section>)}</article>
      </div>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
