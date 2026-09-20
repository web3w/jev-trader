import type { Locale } from "@/lib/i18n";

// Give each language a stable URL and preserve the existing English address.
export const scoreFaqPaths: Record<Locale, string> = {
  en: "/faq/jev-score",
  "zh-CN": "/zh/faq/jev-score",
  ko: "/ko/faq/jev-score",
};

export const scoreFaqUrls = Object.fromEntries(
  Object.entries(scoreFaqPaths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]),
);
