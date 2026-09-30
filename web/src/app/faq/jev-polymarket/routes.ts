import type { Locale } from "@/lib/i18n";

export const articlePaths: Record<Locale, string> = {
  "en": "/faq/jev-polymarket",
  "zh-CN": "/zh/faq/jev-polymarket",
  "ko": "/ko/faq/jev-polymarket"
};
export const articleTitles: Record<Locale, string> = {
  "en": "How to use Jev to evaluate and buy Polymarket shares",
  "zh-CN": "如何使用 Jev 分析并购买 Polymarket 份额",
  "ko": "Jev로 Polymarket 결과를 분석하고 지분을 매수하는 방법"
};
export const articleDescriptions: Record<Locale, string> = {
  "en": "Learn how to define Polymarket questions, choose Noul, Choice or Score, compare probabilities with prices and distinguish orders from fills.",
  "zh-CN": "了解如何定义 Polymarket 问题、选择 Noul、Choice 或 Score、比较概率与价格，并区分订单与成交。",
  "ko": "Polymarket 질문을 정의하고 Noul, Choice, Score를 선택해 확률과 가격을 비교하며 주문과 체결을 구분하는 방법을 알아보세요."
};
export const articleUrls = Object.fromEntries(Object.entries(articlePaths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]));
