import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { articleContent, articleSources } from "./content";
import { articlePaths, articleUrls, articleTitles, articleDescriptions, type ArticleLocale } from "./routes";
import styles from "../../zh/faq/jev-trading/page.module.css";

const articleLanguages = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文" },
] as const;

export function articleMetadata(locale: ArticleLocale): Metadata {
  const title = articleTitles[locale], description = articleDescriptions[locale], url = articleUrls[locale];
  return {
    title: `${title} | Jev Trader`, description,
    alternates: { canonical: url, languages: { ...articleUrls, "x-default": articleUrls.en } },
    openGraph: {
      images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader" }],
      title, description, url, type: "article", locale: locale === "en" ? "en_US" : "zh_CN",
    },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
  };
}

export default function ArticlePage({ locale }: { locale: ArticleLocale }) {
  const content = articleContent[locale];
  const index = locale === "en" ? "/faq" : "/zh/faq";
  const labels = locale === "en"
    ? { back: "Back to FAQ", contents: "Contents", language: "Language", reviewed: "Reviewed", related: "Related reading" }
    : { back: "返回 FAQ", contents: "目录", language: "语言", reviewed: "核验日期", related: "相关阅读" };
  const related = locale === "en" ? [
    { href: "/faq/jev-ai-decision-model", label: "How Jev turns context into decisions" },
    { href: "/faq/jev-trading", label: "How Jev drives trading" },
    { href: "/faq/jev-confidence-trading", label: "Jev confidence and trading calibration" },
  ] : [
    { href: "/faq/jev-ai-decision-model", label: "Jev 如何把上下文转化为决策" },
    { href: "/zh/faq/jev-trading", label: "Jev 如何驱动交易" },
    { href: "/zh/faq/jev-confidence-trading", label: "Jev 置信度与交易校准" },
  ];
  const schema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: articleTitles[locale], description: articleDescriptions[locale],
    url: articleUrls[locale], inLanguage: locale, dateModified: "2026-09-30", citation: articleSources,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <main className={styles.page} lang={locale}>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>‖ Jev Trader</a>
        <nav aria-label={labels.language}>{articleLanguages.map(({ code, label }) => <a key={code} href={articlePaths[code]} hrefLang={code} lang={code} aria-current={code === locale ? "page" : undefined}>{label}</a>)}</nav>
      </header>
      <div className={styles.content}>
        <a className={styles.back} href={index}>← {labels.back}</a>
        <h1>{articleTitles[locale]}</h1>
        <p className={styles.eyebrow}>{labels.reviewed}: <time dateTime="2026-09-30">{locale === "en" ? "September 30, 2026" : "2026 年 9 月 30 日"}</time></p>
        <nav className={styles.contents} aria-label={labels.contents}><ol>{content.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\. /, "")}</a></li>)}</ol></nav>
        <article className={styles.article}>
          {content.introduction}
          {content.sections.map(section => <section key={section.id}><h2 id={section.id}>{section.title}</h2>{section.body}</section>)}
          <nav aria-label={labels.related}><p><strong>{labels.related}</strong></p><ul>{related.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></nav>
        </article>
      </div>
    </main>
    <SiteFooter locale={locale} />
  </>;
}
