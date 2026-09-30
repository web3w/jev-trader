export type ArticleLocale = "en" | "zh-CN";

export const articlePaths: Record<ArticleLocale, string> = {
  en: "/faq/nimble-ollama-vs-jev",
  "zh-CN": "/zh/faq/nimble-ollama-vs-jev",
};
export const articleTitles: Record<ArticleLocale, string> = {
  en: "Nimble on Ollama vs Jev: Test the Same Decision API",
  "zh-CN": "Ollama 本地 Nimble 与 Jev：用同一套决策请求做比较",
};
export const articleDescriptions: Record<ArticleLocale, string> = {
  en: "Run one typed-decision request on local Nimble and hosted Jev. Compare the same inputs, record versions and failures, and keep execution in code.",
  "zh-CN": "用同一份输入和问题比较本地 Nimble 与托管 Jev，记录版本、延迟与失败，保留可复现的测试过程，并由代码控制执行。",
};
export const articleUrls: Record<ArticleLocale, string> = {
  en: `https://jev-trader.com${articlePaths.en}`,
  "zh-CN": `https://jev-trader.com${articlePaths["zh-CN"]}`,
};
