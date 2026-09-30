# Polymarket tool implementation plan

**Goal:** Adapt the reference market explorer into a multilingual Jev Trader tool at `/tools/polymarket`, `/zh/tools/polymarket` and `/ko/tools/polymarket`.

**Architecture:** A server-rendered page supplies localized explanations and metadata. A client component switches between three reference cases, edits the question/rules/evidence/criteria, previews a Jev request, and calculates comparisons from manually entered probabilities and prices. The tool does not call inference or place orders. Historical quotes retain their source timestamps. Existing Ask Jev Trading remains unchanged.

**Scope approved:** The user selected adding the tool inside Jev Trader after reviewing the proposed case-switching, editing, comparison and market-link workflow. This supersedes the FAQ publishing proposal.

1. Define and test probability validation, YES/NO comparisons and request generation in `web/src/app/tools/polymarket/model.ts` and `web/scripts/polymarket.test.ts`. Verify blank inputs do not become zero, distributions are not silently normalized, Score is a level mean, and fees affect both sides.
2. Add localized case data, UI copy, page metadata, tool component and styles under `web/src/app/tools/polymarket/`; add the two translated route wrappers. Keep calculations in the browser and complete explanatory content in initial HTML.
3. Add the three canonical URLs to the existing sitemap and a localized footer Tools link. Preserve all unrelated work.
4. Run unit/navigation tests, production build, existing SEO checks and tool-specific HTTP checks. Check all model modes, editing/reset, invalid input, language links, refresh/back navigation and mobile overflow in the browser. Leave a local preview available; do not deploy.

**Acceptance:** No invented model results or live quotes. Request preview reflects edits and validates required fields. Missing or invalid probabilities yield no comparison. Correct YES and NO comparisons use entered cents per share. All three locale pages have reciprocal hreflang and independent canonicals, crawlable links and real 404 behavior.
