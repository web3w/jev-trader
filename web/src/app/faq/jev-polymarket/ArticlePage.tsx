import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { languages, type Locale } from "@/lib/i18n";
import { articleContent } from "./content";
import { articlePaths, articleUrls, articleTitles, articleDescriptions } from "./routes";
import styles from "../../zh/faq/jev-trading/page.module.css";

export function articleMetadata(locale: Locale): Metadata {
  const title = articleTitles[locale], description = articleDescriptions[locale], url = articleUrls[locale];
  return {
    title: `${title} | Jev Trader`, description,
    alternates: { canonical: url, languages: { ...articleUrls, "x-default": articleUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, type: "article", locale: { en: "en_US", "zh-CN": "zh_CN", ko: "ko_KR" }[locale] },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
  };
}

export default function ArticlePage({ locale }: { locale: Locale }) {
  const content = articleContent[locale];
  const index = locale === "en" ? "/faq" : locale === "zh-CN" ? "/zh/faq" : "/ko/faq";
  const labels = { en: ["Back to FAQ", "Contents", "Language"], "zh-CN": ["返回 FAQ", "目录", "语言"], ko: ["FAQ로 돌아가기", "목차", "언어"] }[locale];
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: articleTitles[locale], description: articleDescriptions[locale], url: articleUrls[locale], inLanguage: locale };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <main className={styles.page} lang={locale}>
      <header className={styles.header}><a href="/" className={styles.brand}>‖ Jev Trader</a>
        <nav aria-label={labels[2]}>{languages.map(({ code, label }) => <a key={code} href={articlePaths[code]} hrefLang={code} lang={code} aria-current={code === locale ? "page" : undefined}>{label}</a>)}</nav>
      </header>
      <div className={styles.content}>
        <a className={styles.back} href={index}>← {labels[0]}</a>
        <h1>{articleTitles[locale]}</h1>
        <nav className={styles.contents} aria-label={labels[1]}><ol>{content.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\. /, "")}</a></li>)}</ol></nav>
        <article className={styles.article}>{content.introduction}{content.sections.map(section => <section key={section.id}><h2 id={section.id}>{section.title}</h2>{section.body}</section>)}</article>
      </div>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
