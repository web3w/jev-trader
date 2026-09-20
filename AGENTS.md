# Project development constraints

Use English for communication, plans and comments on core logic. Prefer minimal, verifiable implementations, change only files required by the current request, and preserve other contributors' uncommitted changes.

## Google Search and AI retrieval guidelines

These constraints apply when adding or changing public pages, routes, navigation, language versions and metadata. Make content useful, accessible and citable for readers before applying technical optimizations. Never promise indexing, rankings, rich results or AI citations.

### Routes and languages

- Use stable, short, descriptive lowercase English paths with hyphens. Use `/faq/<topic>` for FAQs; do not create keyword variants for the same question.
- Keep English URLs without a language prefix. Use `/zh/` and `/ko/` for new Chinese and Korean content, such as `/faq/jev-score`, `/zh/faq/jev-score` and `/ko/faq/jev-score`. `/zh/` corresponds to `zh-CN`.
- The URL determines the language of content pages. Include the complete content in that language in the initial HTML; do not depend on localStorage, browser language or interaction, or serve different versions by User-Agent.
- Each language version must have its own canonical URL and reciprocal `hreflang` links, including itself and `x-default`. Do not canonicalize all translations to English.
- Use real `<a href>` links for language switching and content navigation so they work without JavaScript. Set `lang` explicitly on the article region and keep the document language consistent with the client experience.
- Use permanent redirects when renaming published URLs. Missing pages must return real 404 responses. Link directories only when real index pages exist; do not link to an empty `/faq`.

### Pages and content

- Prefer static generation or server rendering for tutorials, guides and FAQs. Initial HTML must include the H1, questions and answers, examples, tables and sources. Reading content must not require client components to run.
- Use one H1 per page. Organize content with clear H2/H3 headings, paragraphs, semantic tables and stable section anchors. Answer directly before providing explanations and examples.
- Give each page a unique title, description, canonical URL and sharing metadata consistent with its content and language. Avoid keyword stuffing.
- Provide verifiable sources for data, measurements and rules. Distinguish screenshot records, teaching examples, live results and inferences, including relevant dates and limitations.
- Structured data must match visible content. Tutorials may use Article; do not invent authors, dates, ratings, questions or business entities. Escape `<` when serializing JSON-LD.
- Do not treat FAQPage markup as a guarantee of Google FAQ rich results. Google stopped displaying this feature on 2026-05-07; verify current official documentation before adopting it.
- Keep pages readable on mobile. Code blocks and wide tables must scroll within their own containers without causing page-wide horizontal overflow. Support keyboard interaction and visible focus styles.
- Live trading pages must retain server-readable explanations of their purpose and workflow. Never fabricate live prices, positions, trades or returns for search visibility.

### Crawling and discovery

- Add crawlable links from existing related pages so new content is not isolated. Include only real, accessible, canonical public URLs in the sitemap, updating language versions together. Do not fabricate lastmod.
- Allow crawling of public content and necessary rendering resources while retaining crawl restrictions for live `/api/` endpoints. robots.txt is not access control; protect confidential data on the server.
- Distinguish search crawlers from training crawlers: OAI-SearchBot is for search, while GPTBot is for training. Do not change the user's training crawl policy in the name of AI friendliness.
- Before adding specific User-Agent rules, check whether they override the wildcard group and accidentally expose `/api/` to crawling. At deployment, also check whether the CDN/WAF blocks intended crawlers; local changes alone do not prove production crawlability.
- Prioritize stable HTML, internal links, canonical URLs, hreflang, sitemaps and accurate content. `llms.txt` is not required by Google Search or AI search. Maintain it only for an explicit consumer need; do not substitute it for page content or promise rankings.

### Verification and deployment

- Inspect actual HTTP responses, not only pages after JavaScript runs. Ordinary requests, Googlebot and OAI-SearchBot must receive the same content.
- Check content, canonical URLs, hreflang, language links, structured data, sitemap, robots and invalid-URL 404 responses for every language. Then verify language switching, refresh, back navigation and mobile rendering.
- FAQ crawl checks: run `bun run build` in `web`, start a local server, then run `bun run check:seo`. The default URL is `http://127.0.0.1:3010`; use `FAQ_BASE_URL` to override it.
- Do not deploy when the user requests only a local preview. When frontend deployment is authorized, update only the frontend service without restarting the trading backend; verify the production domain afterward. Search Console submissions and CDN changes must remain within the user's authorization.

## Official references

Checked on 2026-09-20. Recheck when platform policies may have changed.

- Google AI search optimization: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google multilingual sites: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google language versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search updates (FAQ rich results retirement): https://developers.google.com/search/updates
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
