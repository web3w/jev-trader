"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import { languages, messages, type Locale } from "@/lib/i18n";
import { scoreFaqContent, scoreRequest, screenshotResults } from "./content";
import { scoreFaqPaths } from "./routes";
import styles from "./page.module.css";

const sources = [
  { title: "API reference", href: "https://docs.typesafe.ai/api" },
  { title: "Score", href: "https://docs.typesafe.ai/primitives/score" },
  { title: "Confidence", href: "https://docs.typesafe.ai/confidence" },
  { title: "Primitives / Questions", href: "https://docs.typesafe.ai/primitives" },
];

export default function ScoreFaq({ locale }: { locale: Locale }) {
  const copy = scoreFaqContent[locale];

  // The URL determines article language; only sync reading preferences, never replace the language from local storage after mounting.
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem("jev-trader-language", locale); } catch {
      // Static content and language links remain usable when local storage is unavailable.
    }
  }, [locale]);

  return (
    <div className={styles.page} lang={locale}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <div className={styles.headerActions}>
          <Link href="/faq/jev-ai-decision-model">← {copy.back}</Link>
          <nav className={styles.languageLinks} aria-label={messages[locale].language}>
            {languages.map((language) => <Link key={language.code} href={scoreFaqPaths[language.code]} hrefLang={language.code} lang={language.code} aria-current={language.code === locale ? "page" : undefined}>{language.label}</Link>)}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>FAQ / Score</p>
          <h1>{copy.title}</h1>
          <p className={styles.intro}>{copy.intro}</p>
          <a className={styles.caseLink} href="#case-study">{copy.caseLink} <span aria-hidden="true">↘</span></a>
          <Image
            className={styles.brandBanner}
            src="/jev-trader-banner.png"
            alt={{ en: "Jev Trader: explore AI trading decisions with Choice, Score and Noul; HYPE/USDC and MON/USDC paper trading.", "zh-CN": "Jev Trader：通过 Choice、Score 和 Noul 探索 AI 交易决策，提供 HYPE/USDC 与 MON/USDC 模拟交易。", ko: "Jev Trader: Choice, Score, Noul을 통한 AI 거래 결정과 HYPE/USDC 및 MON/USDC 모의 거래." }[locale]}
            width={1730}
            height={909}
            sizes="(max-width: 600px) calc(100vw - 66px), (max-width: 912px) calc(100vw - 112px), 800px"
          />
        </div>

        <nav className={styles.contents} aria-label={copy.toc}>
          <p>{copy.toc}</p>
          <ol>{copy.questions.map((question) => <li key={question.id}><a href={`#${question.id}`}>{question.title}</a></li>)}</ol>
        </nav>

        <article className={styles.article}>
          {copy.questions.map((question) => (
            <section key={question.id} id={question.id} className={styles.question} aria-labelledby={`${question.id}-title`}>
              <h2 id={`${question.id}-title`}>{question.title}</h2>
              {question.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

              {question.id === "request" && <div className={styles.request}>
                <h3>{copy.requestLabel}</h3>
                <p>{copy.requestNote}</p>
                <div className={styles.endpoint}><span>POST</span><code>https://api.typesafe.ai/v1/systemone</code></div>
                <pre tabIndex={0} aria-label={copy.requestLabel}><code>{JSON.stringify(scoreRequest, null, 2)}</code></pre>
              </div>}

              {question.id === "read-results" && <figure className={styles.formula}>
                <figcaption>{copy.formulaLabel}</figcaption>
                <code>score = Σ(i × pᵢ)</code>
              </figure>}

              {question.id === "case-study" && <>
                {/* Fixed screenshot data is for teaching only; language changes do not trigger model or trading requests. */}
                <div className={styles.results}>
                  {screenshotResults.map((result, index) => <div key={result.name}>
                    <p>{copy.subjects[index]} <strong>{result.name}</strong></p>
                    <div className={styles.score}>{result.score}<span>/ 4</span></div>
                    <p>{copy.confidence} <strong>{result.confidence}%</strong></p>
                  </div>)}
                </div>
                <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={copy.tableLabel}>
                  <table>
                    <caption>{copy.tableLabel}</caption>
                    <thead><tr>{copy.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
                    <tbody>{copy.levels.map((level, index) => <tr key={index}>
                      <th scope="row">{index}</th><td>{level}</td>
                      {screenshotResults.map((result) => <td key={result.name}>
                        <div className={styles.probability}>
                          <span className={styles.bar} aria-hidden="true"><span style={{ width: `${result.probabilities[index]}%` }} /></span>
                          <span>{result.probabilities[index]}%</span>
                        </div>
                      </td>)}
                    </tr>)}</tbody>
                  </table>
                </div>
                <p className={styles.note}>{copy.screenshotNote}</p>
                <div className={styles.calculation}>
                  <p><strong>Naruto</strong><code>2 × 0.03 + 3 × 0.42 + 4 × 0.55 = 3.52</code></p>
                  <p><strong>Slater</strong><code>1 × 0.69 + 2 × 0.13 + 3 × 0.07 + 4 × 0.01 = 1.20</code></p>
                </div>
              </>}
            </section>
          ))}
        </article>

        <footer className={styles.sources}>
          <h2>{copy.sourcesTitle}</h2>
          <p>{copy.sourcesNote}</p>
          <ul>{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul>
          <Link href="/faq/jev-ai-decision-model">← {copy.back}</Link>
        </footer>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
