import assert from 'node:assert/strict';

const base = process.env.FAQ_BASE_URL ?? 'http://127.0.0.1:3010';
const pages = [
  ['/tools/ask-jev-trading', 'en', 'How to use', 'Submit question'],
  ['/zh/tools/ask-jev-trading', 'zh-CN', '使用引导', '提交问题'],
  ['/ko/tools/ask-jev-trading', 'ko', '사용 안내', '질문 제출'],
];
const canonicalOrigin = 'https://jev-trader.com';
const userAgents = ['Mozilla/5.0', 'Googlebot', 'OAI-SearchBot'];
for (const [path, locale, guide, button] of pages) {
  let reference;
  for (const agent of userAgents) {
    const response = await fetch(base + path, { headers: { 'User-Agent': agent } });
    assert.equal(response.status, 200, `${path}: ${agent} status`);
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main, `${path}: server-rendered main`);
    assert.match(main, new RegExp(`lang="${locale}"`));
    assert.equal((main.match(/<h1\b/g) ?? []).length, 1);
    assert.ok(main.includes(guide) && main.includes(button), `${path}: localized guide and form`);
    assert.ok(html.includes(`rel="canonical" href="${canonicalOrigin}${path}"`));
    for (const [otherPath, otherLocale] of pages) {
      assert.ok(html.includes(`hrefLang="${otherLocale}" href="${canonicalOrigin}${otherPath}"`), `${path}: hreflang ${otherLocale}`);
      assert.ok(main.includes(`href="${otherPath}"`), `${path}: language navigation`);
    }
    assert.ok(html.includes(`hrefLang="x-default" href="${canonicalOrigin}/tools/ask-jev-trading"`));
    if (reference) assert.equal(main, reference, `${path}: same HTML across crawlers`);
    reference = main;
  }
}
const home = await (await fetch(base)).text();
assert.ok(home.includes('footer-tools') && home.includes('href="/tools/ask-jev-trading"'));
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
for (const [path] of pages) assert.ok(sitemap.includes(canonicalOrigin + path));
const robots = await (await fetch(base + '/robots.txt')).text();
assert.ok(robots.includes('Disallow: /api/'));
assert.equal((await fetch(base + '/tools/does-not-exist')).status, 404);
const availability = await fetch(base + '/tools/ask-jev-trading/evaluate');
assert.equal(availability.headers.get('cache-control'), 'no-store');
assert.equal(availability.headers.get('x-robots-tag'), 'noindex');
console.log('Ask Jev Trading: all 3 languages, raw HTML, crawler parity, footer, sitemap, robots and 404 checks passed.');
