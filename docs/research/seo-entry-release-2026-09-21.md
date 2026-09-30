# SEO entry-page release — 2026-09-21

## Scope

- Published the approved initial-market identity fix, server-rendered project introduction, homepage metadata and trading-guide demo links.
- Compared all eight existing affected files on Xenx53 with the pre-edit local backup: all SHA-256 hashes matched. Synced only those eight files plus the new `web/src/app/ProjectIntro.tsx`.
- Built the web image with the production API URL `/api`; validated an isolated temporary container before replacement.
- Updated only web with `docker compose -f deploy/xenx/compose.yaml up -d --no-deps --no-build web`. No backend or proxy configuration changes.

## Release and rollback

- Released image: `sha256:d61c9c9d20f3e2ddee75216b08777540ea0e81ce0168831bd2e3170b4a09218e`.
- Previous image retained as `jev-trader-web:before-entryfix-20260921` (`sha256:62891f74338b852e310bd811823b6dbb78e43ffe98211fae00ae2095dbab7025`).
- Previous web source: `/root/backups/jev-trader/web-before-entryfix-20260921.tar.gz` on Xenx53; dependencies, build output and environment files excluded.
- To revert the running frontend, tag the retained previous image as `jev-trader-web:latest`, then run the same web-only Compose command above. Do not rebuild from the newer source when rolling back the image.
- Removed the temporary `jev-trader-entryfix-check` container after verification.

## Verification

- Production-image build and TypeScript check passed.
- `check-score-faq-seo.mjs` and `check-release-seo.mjs` passed in the candidate container and against `https://jev-trader.com`.
- Checked all 17 sitemap URLs under ordinary, Googlebot and OAI-SearchBot User-Agents; topic checks include initial content, canonical, hreflang, schema, robots, redirects and real 404 responses. This does not verify requests from actual Googlebot IP ranges or Google indexing.
- `node web/scripts/check-market-feed.mjs` passed: both venues delivered complete snapshots and two new blocks. Measured stream-check intervals were 1744ms for Hyperliquid and 3932ms for Kuru.
- Production browser: new title, root canonical and introduction visible; same-origin `/api/venue` returned 200; live market status and data appeared. Switching to Kuru returned 200 and displayed the correct instructions. No page JavaScript errors observed.
- Desktop width 1440px and mobile width 360px had matching document widths, with no page-wide horizontal overflow; homepage had one H1.
- Both production services healthy. Backend container remained `6084b186c14b41735289517b9fb8d1cdb354c24efb0601f3c4525eadf84ba2e2`, started `2026-09-21T11:09:57.277774918Z`; exact before/after comparison passed. Backend simulation memory was not reset by this frontend release.

No Search Console submission, external outreach or ranking claim was made in this release.
