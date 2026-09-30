import assert from "node:assert/strict";

const base = process.env.FAQ_BASE_URL ?? "http://127.0.0.1:3010";
const origin = "https://jev-trader.com";
const pages = [
  { path: "/faq/jev-confidence-trading", locale: "en", title: "Understanding Jev Confidence Before Evaluating a Trading Strategy", markers: ["Illustration only", "MODEL=mock", "random examples", "Brier score", "untouched later data", "no-order reference"] },
  { path: "/zh/faq/jev-confidence-trading", locale: "zh-CN", title: "如何正确理解 Jev confidence 并评估交易模拟", markers: ["以下仅为示意", "MODEL=mock", "随机示例", "Brier score", "未看过的后续数据", "不下单的参考组"] },
];

for (const { path, locale, title, markers } of pages) {
  let expected;
  for (const agent of ["Mozilla/5.0", "Googlebot", "OAI-SearchBot"]) {
    const response = await fetch(base + path, { redirect: "manual", headers: { "User-Agent": agent, "x-page-language": "invalid" } });
    assert.equal(response.status, 200, `${path}: ${agent} HTTP status`);
    assert.ok(!/noindex|nofollow/i.test(response.headers.get("x-robots-tag") ?? ""));
    const html = await response.text();
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`));
    assert.ok(html.includes(`rel="canonical" href="${origin + path}"`));
    assert.ok(!/<meta[^>]*(?:name="robots"|name="googlebot")[^>]*content="[^"]*(?:noindex|nofollow)/i.test(html));
    assert.ok(html.includes('name="description"'));
    assert.ok(html.includes('property="og:type" content="article"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main?.includes(`lang="${locale}"`));
    assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(main.includes(title));
    assert.equal((main.match(/<h2\b/g) ?? []).length, 6);
    for (const marker of markers) assert.ok(main.includes(marker), `${path}: missing ${marker}`);
    assert.ok(main.includes('href="https://docs.typesafe.ai/confidence"'));
    assert.ok(main.includes('href="https://github.com/jarrodwatts/jev-trader"'));
    for (const other of pages) {
      assert.ok(html.includes(`hrefLang="${other.locale}" href="${origin + other.path}"`));
      assert.ok(main.includes(`href="${other.path}"`));
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${origin + pages[0].path}"`));
    assert.ok(!main.includes('href="/ko/faq/jev-confidence-trading"'));
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const article = schemas.find((schema) => schema["@type"] === "Article" && schema.url === origin + path);
    assert.equal(article?.headline, title);
    assert.equal(article?.inLanguage, locale);
    assert.ok(article.citation.includes("https://docs.typesafe.ai/confidence"));
    if (expected) assert.equal(main, expected, `${path}: crawler body parity`); else expected = main;
  }
  const prefix = locale === "en" ? "" : "/zh";
  for (const related of [prefix + "/faq", prefix + "/faq/jev-trading"]) {
    const response = await fetch(base + related);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(`href="${path}"`), `${related}: article discovery link`);
  }
  console.log(`PASS ${path}: complete body, disclosures, crawler parity, metadata, language links and discovery`);
}

const sitemapResponse = await fetch(base + "/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
for (const { path } of pages) assert.equal((sitemap.match(new RegExp(`<loc>${origin + path}</loc>`, "g")) ?? []).length, 1);
assert.ok(!sitemap.includes(origin + "/ko/faq/jev-confidence-trading"));
const robotsResponse = await fetch(base + "/robots.txt");
assert.equal(robotsResponse.status, 200);
const robots = await robotsResponse.text();
assert.match(robots, /User-Agent: \*\s+Allow: \/\s+Disallow: \/api\//i);
assert.ok(robots.includes("Sitemap: " + origin + "/sitemap.xml"));
assert.ok(!robots.includes("jev-confidence-trading"));
for (const path of ["/ko/faq/jev-confidence-trading", "/faq/jev-confidence-trading/missing"]) {
  assert.equal((await fetch(base + path, { redirect: "manual" })).status, 404);
}
console.log("PASS confidence article sitemap, unchanged public crawl policy and missing-language 404s");
