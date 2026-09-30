import assert from "node:assert/strict";
const base = process.env.FAQ_BASE_URL ?? "http://127.0.0.1:3010";
const origin = "https://jev-trader.com";
const poly = ["/faq/jev-polymarket", "/zh/faq/jev-polymarket", "/ko/faq/jev-polymarket"];
for (const path of poly) {
  let expected;
  for (const agent of ["Mozilla/5.0", "Googlebot", "OAI-SearchBot"]) {
    const response = await fetch(base + path, { headers: { "User-Agent": agent } });
    assert.equal(response.status, 200);
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main);
    if (expected) assert.equal(main, expected); else expected = main;
    assert.ok(html.includes(`rel="canonical" href="${origin + path}"`));
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(schemas.some(s => s["@type"] === "Article" && s.url === origin + path));
    assert.ok(main.includes("<table>"));
    if (poly.includes(path)) {
      for (const alternate of poly) assert.ok(html.includes(`href="${origin + alternate}"`));
      assert.equal((main.match(/<h2\b/g) ?? []).length, 6);
      assert.ok(main.includes('href="' + path.replace('/faq/jev-polymarket', '/tools/polymarket') + '"'));
      const tool = await (await fetch(base + path.replace('/faq/jev-polymarket', '/tools/polymarket'))).text();
      assert.ok(tool.includes(`href="${path}"`));
    }
  }
}
for (const path of ["/zh/faq/jev-vs-llm", "/faq/jev-vs-llm", "/ko/faq/jev-vs-llm", "/fr/faq/jev-polymarket"]) assert.equal((await fetch(base + path)).status, 404);
console.log("Restored articles: body, crawler parity, metadata, schema, tool links and missing-language 404s passed.");
