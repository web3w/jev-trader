import type { Locale } from "@/lib/i18n";
import { scoreFaqPaths } from "./jev-score/routes";
import { articlePaths, articleTitles, articleDescriptions } from "./jev-polymarket/routes";

import { articlePaths as confidencePaths, articleTitles as confidenceTitles, articleDescriptions as confidenceDescriptions } from "./jev-confidence-trading/routes";
import { articlePaths as nimblePaths, articleTitles as nimbleTitles, articleDescriptions as nimbleDescriptions } from "./nimble-ollama-vs-jev/routes";

export const faqIndexPaths: Record<Locale, string> = {
  en: "/faq",
  "zh-CN": "/zh/faq",
  ko: "/ko/faq",
};

export interface FaqArticle {
  id: string;
  paths: Partial<Record<Locale, string>>;
  title: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
}

// Keep published articles newest first. Add each new article once, above older entries.
// List only real pages; do not use section anchors or invent publication dates.
export const faqArticles: FaqArticle[] = [
  { id: "nimble-ollama-vs-jev", paths: nimblePaths, title: nimbleTitles, description: nimbleDescriptions },
  { id: "jev-confidence-trading", paths: confidencePaths, title: confidenceTitles, description: confidenceDescriptions },
  {
    id: "jev-polymarket",
    paths: articlePaths,
    title: articleTitles,
    description: articleDescriptions,
  },
  {
    id: "jev-trading",
    paths: { en: "/faq/jev-trading", "zh-CN": "/zh/faq/jev-trading" },
    title: { en: "How Jev drives trading", "zh-CN": "Jev 如何驱动交易：从行情到订单" },
    description: { en: "A guide to the trading workflow, prompt design and Jev API parameters, with diagrams and comments for every field.", "zh-CN": "通过流程图了解交易业务流程、Prompt 设计，以及带逐字段中文注释的 Jev 请求和返回参数。" },
  },
  {
    id: "jev-score",
    paths: scoreFaqPaths,
    title: { en: "How to use Jev Score", "zh-CN": "Jev Score 如何使用", ko: "Jev Score 사용법" },
    description: {
      en: "Write scoring questions, define a rubric and interpret scores, probabilities and confidence with a worked example.",
      "zh-CN": "通过完整案例了解评分问题、评分标准，以及分数、概率和置信度的含义。",
      ko: "예제를 통해 평가 질문과 기준을 작성하고 점수, 확률, 신뢰도를 해석하는 방법을 알아보세요.",
    },
  },
  {
    id: "jev-ai-decision-model",
    paths: { en: "/faq/jev-ai-decision-model", "zh-CN": "/faq/jev-ai-decision-model", ko: "/faq/jev-ai-decision-model" },
    title: { en: "How Jev turns context into decisions", "zh-CN": "Jev 如何将上下文转化为决策", ko: "Jev가 맥락을 의사결정으로 바꾸는 방법" },
    description: {
      en: "Understand Noul, Choice and Score, parallel evaluation and the role of Jev in a trading application.",
      "zh-CN": "了解 Noul、Choice、Score、并行评估，以及 Jev 在交易程序中的作用。",
      ko: "Noul, Choice, Score, 병렬 평가 및 거래 프로그램에서 Jev의 역할을 알아보세요.",
    },
  },
];

export const faqIndexCopy = {
  en: { title: "FAQ", intro: "Guides and answers about Jev models and trading decisions, newest first.", back: "Back to trading", more: "More →", read: "Read article →" },
  "zh-CN": { title: "FAQ", intro: "关于 Jev 模型与交易决策的指南和解答，按最新顺序排列。", back: "返回交易看板", more: "更多 →", read: "阅读文章 →" },
  ko: { title: "FAQ", intro: "Jev 모델과 거래 결정에 관한 가이드와 답변을 최신순으로 확인하세요.", back: "거래 화면으로", more: "더 보기 →", read: "글 읽기 →" },
};
