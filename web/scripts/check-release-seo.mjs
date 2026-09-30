import assert from "node:assert/strict";

const base = process.env.FAQ_BASE_URL ?? "http://127.0.0.1:3187";
const origin = "https://jev-trader.com";
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const failures = [];
for (const url of urls) {
  const path = new URL(url).pathname;
  const language = path.startsWith("/zh/") ? "zh-CN" : path.startsWith("/ko/") ? "ko" : "en";
  for (const agent of ["Mozilla/5.0", "Googlebot", "OAI-SearchBot"]) {
    try {
      const response = await fetch(base + path, { headers: { "User-Agent": agent, "x-page-language": "invalid" }, redirect: "manual" });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(new RegExp(`<html[^>]*lang="${language}"`).test(html), `document language must be ${language}`);
      assert.ok(html.includes(`rel="canonical" href="${url}"`));
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
      assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
      assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") ?? ""));
    } catch (error) { failures.push(`${path} (${agent}): ${error.message}`); }
  }
}
for (const path of ["/privacy-policy", "/terms-of-service"]) {
  try {
    assert.ok(!urls.includes(origin + path), `${path}: draft excluded from sitemap`);
    const html = await (await fetch(base + path)).text();
    assert.match(html, /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/);
  } catch (error) { failures.push(error.message); }
}
assert.deepEqual(failures, []);
console.log(`Release SEO: ${urls.length} sitemap pages across 3 user agents, document languages, canonical URLs and draft exclusions passed.`);
