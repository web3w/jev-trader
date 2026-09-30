import assert from "node:assert/strict";

const base = process.env.FAQ_BASE_URL ?? "http://127.0.0.1:3010";
const origin = "https://jev-trader.com";
const pages = [
  ["/tools/polymarket", "en", "From market rules to informed decisions.", "Compare prices"],
  ["/zh/tools/polymarket", "zh-CN", "从市场规则出发，形成有依据的判断。", "比较价格"],
  ["/ko/tools/polymarket", "ko", "시장 규칙에서 근거 있는 판단으로.", "가격 비교"],
];

for (const [path, locale, tagline, action] of pages) {
  let expected;
  for (const agent of ["Mozilla/5.0", "Googlebot", "OAI-SearchBot"]) {
    const response = await fetch(base + path, { headers: { "User-Agent": agent } });
    assert.equal(response.status, 200);
    assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") ?? ""));
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main?.includes(`lang="${locale}"`));
    assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(main.includes(tagline) && main.includes(action));
    assert.ok(main.includes("Jev for Polymarket") && main.includes("2026-09-20"));
    assert.ok(main.includes('id="how-to-use"'));
    assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`));
    assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html));
    for (const [alternate, language] of pages) {
      assert.ok(html.includes(`hrefLang="${language}" href="${origin}${alternate}"`));
      assert.ok(main.includes(`href="${alternate}"`));
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${origin}/tools/polymarket"`));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@type"], "WebApplication");
    assert.equal(schema.name, "Jev for Polymarket");
    assert.equal(schema.inLanguage, locale);
    assert.equal(schema.url, origin + path);
    if (expected) assert.equal(main, expected, "same content for crawlers");
    expected = main;
  }
  assert.equal((await fetch(base + path + "/missing")).status, 404);
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
for (const [path] of pages) assert.ok(sitemap.includes(origin + path));
const home = await (await fetch(base)).text();
assert.ok(home.includes('href="/tools/polymarket"'));
const robots = await (await fetch(base + "/robots.txt")).text();
assert.ok(robots.includes("Disallow: /api/"));
console.log("Jev for Polymarket: all three languages, initial HTML, crawler parity, metadata, schema, sitemap, footer and 404 checks passed.");
