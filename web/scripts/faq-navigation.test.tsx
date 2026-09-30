import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import SiteFooter from "../src/components/SiteFooter/SiteFooter";
import { faqArticles, faqIndexCopy, faqIndexPaths, type FaqArticle } from "../src/app/faq/articles";

for (const locale of ["en", "zh-CN", "ko"] as const) {
  for (const count of [2, 3, 4]) {
    test(`${locale}: ${count} articles retain newest three and show More only on overflow`, () => {
      const original = [...faqArticles];
      const fixtures: FaqArticle[] = Array.from({ length: count }, (_, index) => ({
        id: `article-${index}`,
        paths: { en: `/faq/article-${index}`, "zh-CN": `/zh/faq/article-${index}`, ko: `/ko/faq/article-${index}` },
        title: { en: `Article ${index}`, "zh-CN": `文章 ${index}`, ko: `글 ${index}` },
        description: { en: "Example", "zh-CN": "示例", ko: "예제" },
      }));
      try {
        // Exercise the actual footer with future catalog sizes, without adding fake published pages.
        faqArticles.splice(0, faqArticles.length, ...fixtures);
        const html = renderToStaticMarkup(<SiteFooter locale={locale} />);
        const list = html.match(/<ul data-faq-articles[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? "";
        expect((list.match(/<li>/g) ?? []).length).toBe(Math.min(count, 3));
        const paths = [...list.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
        expect(paths).toEqual(fixtures.slice(0, 3).map((article) => article.paths[locale]!));
        expect(html.includes(faqIndexCopy[locale].more)).toBe(count > 3);
        if (count > 3) expect(html).toContain(`href="${faqIndexPaths[locale]}">${faqIndexCopy[locale].more}</a>`);
        expect(html).not.toContain("footer-learn");
      } finally {
        faqArticles.splice(0, faqArticles.length, ...original);
      }
    });
  }
}

test("Chinese-only articles do not create untranslated links or affect other language counts", () => {
  const original = [...faqArticles];
  try {
    faqArticles.splice(0, faqArticles.length,
      {
        id: "chinese-only",
        paths: { "zh-CN": "/zh/faq/chinese-only" },
        title: { "zh-CN": "中文文章" },
        description: { "zh-CN": "中文说明" },
      },
      ...Array.from({ length: 3 }, (_, index) => ({
        id: `shared-${index}`,
        paths: { en: `/faq/shared-${index}`, "zh-CN": `/zh/faq/shared-${index}`, ko: `/ko/faq/shared-${index}` },
        title: { en: "Shared", "zh-CN": "多语言文章", ko: "공유" },
        description: { en: "Example", "zh-CN": "示例", ko: "예제" },
      })),
    );
    for (const locale of ["en", "zh-CN", "ko"] as const) {
      const html = renderToStaticMarkup(<SiteFooter locale={locale} />);
      expect(html.includes('/zh/faq/chinese-only')).toBe(locale === "zh-CN");
      expect(html.includes(faqIndexCopy[locale].more)).toBe(locale === "zh-CN");
      expect(html).not.toContain('href="undefined"');
    }
  } finally {
    faqArticles.splice(0, faqArticles.length, ...original);
  }
});

test("the English FAQ directory links to the English trading article", async () => {
  const { default: FaqIndex } = await import("../src/app/faq/FaqIndex");
  const html = renderToStaticMarkup(<FaqIndex locale="en" />);
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
  expect(main).toContain('href="/faq/jev-trading"');
  expect(main).toContain('hrefLang="en"');
  expect(main).not.toContain('(Chinese)');
  expect(main).not.toContain('href="/zh/faq/jev-trading"');
});

for (const [locale, path] of [["en", "/faq/jev-polymarket"], ["zh-CN", "/zh/faq/jev-polymarket"], ["ko", "/ko/faq/jev-polymarket"]] as const) {
  test(`${locale}: Polymarket article is distinct from the tool in the FAQ directory`, async () => {
    const { default: FaqIndex } = await import("../src/app/faq/FaqIndex");
    const html = renderToStaticMarkup(<FaqIndex locale={locale} />);
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
    expect(main).toContain(`href="${path}"`);
    expect(main).not.toContain('/tools/polymarket');
    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? "";
    expect(footer).toContain(`href="${path}"`);
    expect(footer).toContain('/tools/polymarket');
  });
}

test("Chinese directory contains four articles after removing the comparison", async () => {
  const { faqArticles } = await import("../src/app/faq/articles");
  expect(faqArticles).toHaveLength(4);
  const { default: FaqIndex } = await import("../src/app/faq/FaqIndex");
  const html = renderToStaticMarkup(<FaqIndex locale="zh-CN" />);
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] ?? "";
  expect(main).not.toContain("jev-vs-llm");
  for (const article of faqArticles) expect(main).toContain(`href="${article.paths["zh-CN"]}"`);
});
