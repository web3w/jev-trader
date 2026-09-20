import Link from "next/link";
import { scoreFaqContent } from "@/app/faq/jev-score/content";
import { scoreFaqPaths } from "@/app/faq/jev-score/routes";
import type { Locale } from "@/lib/i18n";
import styles from "./SiteFooter.module.css";

const copy = {
  en: {
    learn: ["What is Jev?", "Choice, Score and Noul", "How Jev powers the trader"],
    limitations: "Model limitations & interpretation",
    sources: "Documentation & sources",
    note: "Model outputs may be incorrect. Review the source documentation before relying on a result.",
  },
  "zh-CN": {
    learn: ["什么是 Jev？", "了解 Choice、Score 和 Noul", "Jev 如何驱动交易决策"],
    limitations: "模型局限与结果解读",
    sources: "官方文档与来源",
    note: "模型输出可能出错，使用结果前请核对原始文档。",
  },
  ko: {
    learn: ["Jev란 무엇인가요?", "Choice, Score, Noul 이해하기", "Jev가 거래 결정을 내리는 방법"],
    limitations: "모델의 한계와 결과 해석",
    sources: "공식 문서와 출처",
    note: "모델 출력은 틀릴 수 있습니다. 결과를 활용하기 전에 원본 문서를 확인하세요.",
  },
};

export default function SiteFooter({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const faqPath = scoreFaqPaths[locale];
  const guideSections = ["what-is-jev", "three-decisions", "in-the-trader"];
  // Reuse FAQ titles and stable anchors so footer labels match the actual questions.
  const questions = scoreFaqContent[locale].questions.filter(({ id }) =>
    ["when-to-use", "request", "criteria", "confidence"].includes(id),
  );

  return (
    <footer className={styles.footer}>
      <nav className={styles.columns} aria-label="Learn, FAQ, Legal">
        <section aria-labelledby="footer-learn">
          <h2 id="footer-learn">Learn</h2>
          <ul>
            {text.learn.map((label, index) => (
              <li key={guideSections[index]}><Link href={`/jev-ai-decision-model#${guideSections[index]}`}>{label}</Link></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="footer-faq">
          <h2 id="footer-faq">FAQ</h2>
          <ul>
            {questions.map(({ id, title }) => (
              <li key={id}><Link href={`${faqPath}#${id}`}>{title}</Link></li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="footer-legal">
          <h2 id="footer-legal">Legal</h2>
          <ul>
            <li><Link href={`${faqPath}#common-mistakes`}>{text.limitations}</Link></li>
            <li><Link href="https://docs.typesafe.ai/api">{text.sources}</Link></li>
          </ul>
          <p>{text.note}</p>
        </section>
      </nav>
    </footer>
  );
}
