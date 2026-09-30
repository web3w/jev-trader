# About and Polymarket article release — 2026-09-21

Published the separate About page, removed the homepage introduction, and restored the three-language Polymarket article independently of the tool. The deleted JEV/LLM comparison remains absent and returns 404. Chinese FAQ contains four articles. Sitemap contains 21 canonical public pages including About and all Polymarket article translations.

Only frontend source differences were synchronized. Local environment files, generated build files and backend changes were excluded. Production build uses `/api`. Candidate container checks passed before web-only replacement with `up -d --no-deps --no-build web`.

- Image: `sha256:39354bbae8704893b4ba9277d8666220e71758ae7911edc0f681c8de845dba80`.
- Rollback image: `jev-trader-web:before-about-20260921`.
- Source backup: `/root/backups/jev-trader/web-before-about-20260921.tar.gz` on Xenx53.
- Backend ID and start time unchanged: `6084b186c14b41735289517b9fb8d1cdb354c24efb0601f3c4525eadf84ba2e2`, `2026-09-21T11:09:57.277774918Z`.

Production verification: all 21 sitemap pages checked for three user agents; full FAQ SEO and restored-article checks passed against the public domain from the server. Initial checks from the developer machine encountered intermittent TLS connection resets/timeouts; server rerun passed. Both market streams delivered snapshots and two new blocks. Browser verified the homepage has no introduction section, has the About link, and displays live market status without a connection warning. About page and its navigation loaded correctly. Temporary candidate container removed.

Sitemap was published; no Search Console submission was made.
