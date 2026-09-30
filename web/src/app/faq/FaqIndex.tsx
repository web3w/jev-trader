"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { languages, messages, type Locale } from "@/lib/i18n";
import { faqArticles, faqIndexCopy, faqIndexPaths } from "./articles";
import styles from "./page.module.css";

export default function FaqIndex({ locale }: { locale: Locale }) {
  const copy = faqIndexCopy[locale];
  // The route fixes the rendered language; storage only carries the preference to the trading UI.
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem("jev-trader-language", locale); } catch { /* Reading does not require storage. */ }
  }, [locale]);

  return <div className={styles.layout}>
    <main className={styles.page} lang={locale}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <nav aria-label={messages[locale].language}>
          {languages.map(({ code, label }) => <Link key={code} href={faqIndexPaths[code]} hrefLang={code} lang={code} aria-current={code === locale ? "page" : undefined}>{label}</Link>)}
        </nav>
      </header>
      <div className={styles.content}>
        <Link href="/" className={styles.back}>← {copy.back}</Link>
        <h1>{copy.title}</h1>
        <p className={styles.intro}>{copy.intro}</p>
        <ol className={styles.articles}>
          {faqArticles.map((article) => {
            // The English directory can introduce a Chinese original without inventing an English article URL.
            const articleLocale = article.paths[locale] ? locale : locale === "en" && article.paths["zh-CN"] ? "zh-CN" : null;
            if (!articleLocale) return null;
            const path = article.paths[articleLocale]!;
            return <li key={article.id}>
              <h2><Link href={path} hrefLang={articleLocale}>{article.title[locale] ?? article.title[articleLocale]}</Link></h2>
              <p>{article.description[locale] ?? article.description[articleLocale]}</p>
              <Link className={styles.read} href={path} hrefLang={articleLocale}>{copy.read}</Link>
            </li>;
          })}
        </ol>
      </div>
    </main>
    <SiteFooter locale={locale} />
  </div>;
}
