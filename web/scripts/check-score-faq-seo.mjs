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

// Verify server-rendered market content independently of JavaScript and live feeds.
const marketCases = [
  ["/", "/", "Hyperliquid HYPE/USDC"],
  ["/hyperliquid-hype-usdc", "/", "Hyperliquid HYPE/USDC"],
  ["/kuru-mon-usdc", "/kuru-mon-usdc", "Kuru MON/USDC"],
];
for (const [path, canonical, market] of marketCases) {
  let expectedHeading;
  for (const agent of userAgents) {
    const response = await get(path, agent);
    assert.equal(response.status, 200);
    const html = await response.text();
    const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    assert.equal((visibleHtml.match(/<h1\b/g) || []).length, 1, `${path}: one visible H1`);
    assert.match(html, /<title>Jev Trader/);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${canonical}"`));
    const heading = visibleHtml.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0];
    assert.ok(heading?.includes("Jev Trader"));
    assert.ok(!visibleHtml.includes('id="about-market"'), "do not add a separate market module");
    assert.ok(!visibleHtml.includes("ABOUT THIS MARKET"));
    assert.ok(visibleHtml.includes(market.split(" ")[0]));
    if (path === "/" || path === "/hyperliquid-hype-usdc") {
      assert.ok(!visibleHtml.includes("post a bid or an ask on Kuru"), `${path}: initial instructions must match Hyperliquid`);
      assert.ok(!visibleHtml.includes("Kuru order book contract"), `${path}: no Kuru contract fields`);
      assert.ok(visibleHtml.includes("HyperCore"));
      assert.ok(!visibleHtml.includes('project-intro-title'), "removed project introduction must stay absent");
      assert.ok(visibleHtml.includes('id="trading-dashboard"'));
      assert.ok(html.includes("Trading Demo &amp; Project Guide"));
    } else {
      assert.ok(visibleHtml.includes("post a bid or an ask on Kuru"));
    }
    assert.ok(visibleHtml.includes('href="https://github.com/web3w/jev-trader"'));
    assert.ok(visibleHtml.includes('href="https://github.com/jarrodwatts/jev-trader"'));
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(match, `${path}: missing project structured data`);
    const graph = JSON.parse(match[1])["@graph"];
    const website = graph.find((item) => item["@type"] === "WebSite");
    const app = graph.find((item) => item["@type"] === "WebApplication");
    const source = graph.find((item) => item["@type"] === "SoftwareSourceCode");
    assert.equal(website.url, `${origin}/`);
    assert.equal(source.codeRepository, "https://github.com/web3w/jev-trader");
    assert.equal(source.targetProduct["@id"], app["@id"]);
    assert.equal(website.mainEntity["@id"], app["@id"]);
    assert.ok(!("codeRepository" in app));
    if (expectedHeading) assert.equal(heading, expectedHeading);
    expectedHeading = heading;
  }
  console.log(`PASS ${path}: visible market content, source attribution and project schema`);
}

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
assert.ok(!sitemap.includes(`<loc>${origin}/hyperliquid-hype-usdc</loc>`), "sitemap must exclude the noncanonical market alias");
// Directory pages must be readable and navigable without JavaScript in every language.
const directories = [["/faq", "en"], ["/zh/faq", "zh-CN"], ["/ko/faq", "ko"]];
for (const [path, language] of directories) {
  let expectedMain;
  for (const agent of userAgents) {
    const response = await get(path, agent);
    assert.equal(response.status, 200);
    const html = await response.text();
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const main = visible.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main?.includes(`lang="${language}"`));
    assert.equal((visible.match(/<h1\b/g) || []).length, 1);
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}"`));
    for (const [alternate, lang] of directories) {
      assert.ok(html.includes(`hrefLang="${lang}" href="${origin}${alternate}"`));
      assert.ok(main.includes(`href="${alternate}"`));
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${origin}/faq"`));
    const articlePath = cases.find((item) => item[1] === language)[0];
    assert.ok(main.includes(`href="${articlePath}"`));
    assert.ok(main.includes('href="/faq/jev-ai-decision-model"'));
    assert.ok(!visible.includes('id="footer-learn"'));
    assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`));
    if (expectedMain) assert.equal(main, expectedMain);
    expectedMain = main;
  }
  console.log(`PASS ${path}: localized article directory, canonical and language links`);
}
const robots = await (await get("/robots.txt", "OAI-SearchBot")).text();
assert.match(robots, /User-Agent:\s*\*\s+Allow:\s*\//i);
assert.match(robots, /Disallow:\s*\/api\//i);
assert.ok(robots.includes(`${origin}/sitemap.xml`));
for (const path of ["/fr/faq/jev-score", "/faq/does-not-exist"]) {
  assert.equal((await get(path, "Googlebot")).status, 404, `${path}: invalid pages must return 404`);
}
console.log("PASS sitemap, robots and real 404 responses");

// Each published translation must be complete and crawlable independently.
const tradingPaths = { en: "/faq/jev-trading", "zh-CN": "/zh/faq/jev-trading" };
for (const [language, tradingPath] of Object.entries(tradingPaths)) {
  let expectedTradingContent;
  for (const agent of userAgents) {
    const response = await get(tradingPath, agent);
    assert.equal(response.status, 200);
    const html = await response.text();
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const article = visible.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0];
    assert.ok(article, "trading article must exist without client JavaScript");
    assert.equal((visible.match(/<h1\b/g) || []).length, 1);
    assert.ok(visible.includes(language === "en" ? "How Jev drives trading" : "Jev 如何驱动交易：从行情到订单"));
    assert.ok(visible.includes(`lang="${language}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${tradingPath}"`));
    for (const [locale, path] of Object.entries(tradingPaths)) {
      assert.ok(html.includes(`hrefLang="${locale}" href="${origin}${path}"`));
      assert.ok(visible.includes(`href="${path}" hrefLang="${locale}"`));
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${origin}${tradingPaths.en}"`));
    assert.ok(!/<link\b[^>]*hrefLang="ko"/.test(html), "do not advertise a nonexistent Korean translation");
    assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") || ""));
    assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html));
    for (const id of ["workflow", "interface", "state", "prompt", "response", "execution"]) {
      assert.ok(article.includes(`id="${id}"`));
      assert.ok(visible.includes(`href="#${id}"`));
    }
    assert.equal((article.match(/<figure\b/g) || []).length, 2);
    assert.equal((article.match(/<pre\b/g) || []).length, 6);
    for (const field of ["maxRetries", "horizonBlocks", "bookImbalance", "recentTrades", "allowed", "instructions", "criteria", "probabilities", "upIn10", "trace"]) {
      assert.ok(article.includes(field), `missing annotated parameter: ${field}`);
    }
    assert.ok(language === "en"
      ? article.includes("Legacy field name") && article.includes("Server-side authentication key")
      : article.includes("旧字段名") && article.includes("服务端认证密钥"));
    if (language === "en") assert.ok(!/[\u4e00-\u9fff]/.test(article), "English article must translate prose, code comments and diagrams");
    assert.ok(!article.includes("/Users/") && !article.includes("flowchart TD"));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@type"], "Article");
    assert.equal(schema.inLanguage, language);
    assert.equal(schema.url, `${origin}${tradingPath}`);
    assert.ok(!schema.author && !schema.datePublished);
    if (expectedTradingContent) assert.equal(article, expectedTradingContent);
    expectedTradingContent = article;
  }
  assert.ok(sitemap.includes(`<loc>${origin}${tradingPath}</loc>`));
}
for (const [path, language] of directories) {
  const visible = (await (await get(path, "Googlebot")).text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  for (const [locale, articlePath] of Object.entries(tradingPaths)) {
    assert.equal(visible.includes(`href="${articlePath}"`), language === locale);
  }
  if (language === "en") assert.ok(!visible.includes("(Chinese)"));
}
for (const path of ["/ko/faq/jev-trading", "/zh/faq/does-not-exist"]) {
  assert.equal((await get(path, "Googlebot")).status, 404);
}
console.log("PASS trading FAQ: static article, diagrams, annotated fields, real language links and crawler parity");

const guidePath = "/faq/jev-ai-decision-model";
for (const oldPath of ["/jev-ai-decision-model", "/jev"]) {
  const redirect = await fetch(new URL(oldPath, base), { redirect: "manual" });
  assert.equal(redirect.status, 308);
  assert.equal(new URL(redirect.headers.get("location"), base).pathname, guidePath);
}
for (const agent of userAgents) {
  const response = await get(guidePath, agent);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${guidePath}"`));
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  assert.equal((visible.match(/<h1\b/g) || []).length, 1);
  assert.ok(visible.includes('id="what-is-jev"'));
}
assert.ok(sitemap.includes(`<loc>${origin}${guidePath}</loc>`));
assert.ok(!sitemap.includes(`<loc>${origin}/jev-ai-decision-model</loc>`));
console.log("PASS model guide FAQ route, canonical and permanent redirects");
