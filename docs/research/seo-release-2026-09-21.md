# SEO release verification — 2026-09-21

## Released changes

- Published the current frontend, including Ask Jev Trading, Jev for Polymarket and the English trading FAQ.
- Set the initial document language from the URL through Next.js Proxy and the root layout. Pages now render on the server per request; the sitemap remains static. No browser-language or User-Agent content selection is used.
- Excluded the two explicitly unfinished legal drafts from the sitemap and added noindex, follow. Their unconfirmed operator details have not been fabricated or represented as finalized policies.
- Excluded Bun test files from the production Docker build after the first candidate build exposed missing bun:test types.

## Verification

- Local production build passed; 32 Bun tests passed.
- The following checks passed locally, in a temporary production-image container, and through https://jev-trader.com:
  - scripts/check-score-faq-seo.mjs
  - scripts/check-ask-jev-seo.mjs
  - scripts/check-polymarket-seo.mjs
  - scripts/check-release-seo.mjs
- Verified 17 sitemap URLs across ordinary, Googlebot and OAI-SearchBot requests: status, initial HTML, language, canonical URL, indexability. Topic-specific scripts additionally check hreflang, navigation, structured data, content parity, robots and real 404s.
- All 19 internal link targets extracted from the sitemap pages resolved to HTTP 200.
- Browser checks: local Ask Jev submission, language navigation, reload and back; mobile width 390px without document overflow on Ask Jev, English/Chinese trading articles, Korean Score FAQ and Chinese Polymarket. Production Ask Jev submission returned a clearly labeled random demonstration result.
- Production frontend and backend health checks passed. Backend container ID and start time remained unchanged: 8f27b79959970e6cf0f01beced764290614a6894d237016e6134db944c8572ab; 2026-09-18T13:09:29.481460977Z.

## Deployment and recovery

- Updated only the web service with docker compose up -d --no-deps --no-build web after a successful build and isolated container checks.
- Released image: sha256:62891f74338b852e310bd811823b6dbb78e43ffe98211fae00ae2095dbab7025.
- Previous image retained on Xenx53 as jev-trader-web:before-seo-20260921.
- Previous frontend source archived at /root/backups/jev-trader/web-before-seo-20260921.tar.gz on Xenx53.
- Temporary verification container removed.

## Google submission

Resubmitted https://jev-trader.com/sitemap.xml through the authenticated Search Console interface for sc-domain:jev-trader.com. Google displayed a successful-submission dialog. The resulting table showed submission and last-read dates of September 21, 2026, status Success and 17 discovered pages.

Discovery is not confirmation of indexing. No claim is made that the new pages are already indexed or ranked. Core Web Vitals field data remains unavailable; this release check is not a performance certification. Legal policy completion still requires the operator's verified details.

## Follow-up: market initialization

The initial HTML checks missed a live-feed problem: 1,000-record snapshots were approximately 2.3 MB before compression and could time out over slower connections. The site proxy now compresses JSON and SSE while preserving unbuffered streaming. Production checks verified complete snapshots followed by two new blocks for both venues.

After user approval to restart the backend, the snapshot limit was deployed at 20 and then restored to 100 at the user's request. The final deployed backend image is sha256:302114ffae57c6bf9ab0909d4afee920acb648e82458e4dbbc04b2141ae41c53. Both POST initialization and SSE snapshots use the most recent 100 records; stored history and incremental updates are unchanged. Backend restarts reset in-memory simulation accounts as disclosed. Eight focused tests passed locally and inside the release image; both production markets passed the live-feed smoke check. Both services were healthy after the final rollout.
