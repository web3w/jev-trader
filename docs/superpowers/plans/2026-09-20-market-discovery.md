# Market discovery local preview plan

Goal: make the existing trading pages understandable in initial HTML and accurately connect this deployment to its public source repository.

Approved scope: local preview only. Preserve existing FAQ and banner edits. Do not deploy, push, change CDN settings or restart trading services.

- [x] Extend the existing HTTP SEO check to cover one visible H1 per market page, brand-first titles, canonical URLs, crawlable source links, linked WebSite/WebApplication/SoftwareSourceCode records and exclusion of the HYPE alias from the sitemap. Verify failure against the existing local server.
- [x] Add a server-rendered MarketOverview passed as children to MarketDashboard below the dashboard. Keep English route content explicitly lang=en, independent of stored dashboard language. Explain each market's data, simulated execution and limitations; preserve the current trading UI and model behavior.
- [x] Add localized source and upstream attribution links to SiteFooter. Use only factual project relationships, with codeRepository on SoftwareSourceCode and no invented publisher, author or performance claims.
- [x] Prefix market titles with Jev Trader. Preserve the root canonical for the identical HYPE alias and remove that alias from sitemap.
- [x] Build in web, start a separate local preview, run check:seo, inspect desktop/mobile rendering and language/market navigation, then leave the preview open for review.

Verification: production build and TypeScript passed. HTTP checks passed for three market entries and three FAQ languages with ordinary, Googlebot and OAI-SearchBot requests. Browser checks confirmed one H1, market navigation, Chinese dashboard switching with English overview language labeling, and no horizontal overflow on either market at 390px. Local preview: http://127.0.0.1:3187/#about-market. Backend was started locally with MODEL=mock, DRY_RUN=true and empty keys. No production deployment or Git push.

User revision: remove the separate About market section and its styles. Make the existing header brand the sole H1 without changing its appearance. Keep JSON-LD in a server-rendered ProjectSchema component and retain footer source links. Preview at the root URL; no deployment.
