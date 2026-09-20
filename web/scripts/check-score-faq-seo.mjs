import assert from "node:assert/strict";

// Inspect HTTP response HTML without executing JavaScript, as search crawlers do.
const base = process.env.FAQ_BASE_URL || "http://127.0.0.1:3010";
const origin = "https://jev-trader.com";
const cases = [
  ["/faq/jev-score", "en", "How to use Jev Score"],
  ["/zh/faq/jev-score", "zh-CN", "Jev Score 如何使用"],
  ["/ko/faq/jev-score", "ko", "Jev Score 사용법"],
];
const userAgents = ["Mozilla/5.0", "Googlebot", "OAI-SearchBot"];
const get = (path, agent) => fetch(new URL(path, base), { headers: { "User-Agent": agent } });

for (const [path, language, heading] of cases) {
  let expectedContent;
  for (const agent of userAgents) {
    const response = await get(path, agent);
    assert.equal(response.status, 200, `${path}: ${agent} must return 200`);
    assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") || ""));
    const html = await response.text();
    const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    assert.ok(visibleHtml.includes(heading), `${path}: initial HTML must contain the heading in the requested language`);
    assert.equal((visibleHtml.match(/<h1\b/g) || []).length, 1);
    assert.ok(visibleHtml.includes(`lang="${language}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}"`));
    assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html));
    for (const [alternate, lang] of cases) {
      assert.ok(html.includes(`hrefLang="${lang}" href="${origin}${alternate}"`), `${path}: missing ${lang} hreflang`);
      assert.ok(visibleHtml.includes(`href="${alternate}"`), `${path}: missing crawlable language link`);
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${origin}/faq/jev-score"`));
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(match, `${path}: missing structured data`);
    const schema = JSON.parse(match[1]);
    assert.equal(schema["@type"], "Article");
    assert.equal(schema.inLanguage, language);
    assert.equal(schema.url, `${origin}${path}`);
    assert.ok(schema.headline.startsWith(heading));
    const article = visibleHtml.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
    // Count only article questions, excluding site footer headings.
    assert.equal((article?.match(/<section\b/g) || []).length, 7);
    assert.ok(article?.includes("3.51") && article.includes("1.18"));
    assert.ok(article.includes("probabilities") && article.includes("criteria"));
    if (expectedContent) assert.equal(article, expectedContent, "article content must not vary by crawler identity");
    expectedContent = article;
  }
  console.log(`PASS ${path}: content, language links, canonical and structured data for all three user agents`);
}

const sitemap = await (await get("/sitemap.xml", "Googlebot")).text();
for (const [path] of cases) assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`));
const robots = await (await get("/robots.txt", "OAI-SearchBot")).text();
assert.match(robots, /User-Agent:\s*\*\s+Allow:\s*\//i);
assert.match(robots, /Disallow:\s*\/api\//i);
assert.ok(robots.includes(`${origin}/sitemap.xml`));
for (const path of ["/fr/faq/jev-score", "/faq/does-not-exist"]) {
  assert.equal((await get(path, "Googlebot")).status, 404, `${path}: invalid pages must return 404`);
}
console.log("PASS sitemap, robots and real 404 responses");
