# Ask Jev Trading Implementation Plan

**Goal:** Deliver a local, multilingual trading evaluation tool with explicit mock examples, practical guidance and conclusion-only sharing.

**Architecture:** Server-render localized pages and guidance; isolate the interactive form in a client component. Call TypeSafe through a dedicated Next.js route under `/tools/ask-jev-trading/evaluate`, outside the existing trading `/api/` proxy. Mock examples remain local and never masquerade as model results.

**Tech Stack:** Existing Next.js 16, React 19, CSS modules, native fetch and Bun tests. No new runtime packages.

## Constraints

- Preserve all existing uncommitted work. Do not deploy or restart the trading backend.
- Use the approved name Ask Jev Trading and trading-only questions and examples.
- English, Chinese and Korean URLs determine content language, with canonical and reciprocal hreflang links.
- Keep the established white/warm-neutral surfaces, Inter typography, purple Jev accent and restrained probability bars. Desktop: form left, result right; mobile: one column.
- Mock results are fixed teaching fixtures. Changing user input never produces a fabricated custom evaluation.
- Require an explicitly configured, server-only `ASK_JEV_API_KEY` for real calls. No access to trading credentials.
- Latest user requirement: share only the conclusion, retain the mock/model source label and invite others to the tool. Do not serialize questions, context, unselected options or full responses.

## Tasks

- [x] Add failing Bun tests for input validation, typed answer validation and mock fixtures. Implement the minimal domain functions in `web/src/app/tools/ask-jev-trading/model.ts` and localized fixtures in `content.ts`.
- [x] Add route tests for disabled live mode, invalid requests, origin checks and safe provider results. Implement the bounded request handler in `evaluate/route.ts`; enforce timeouts and single-process request budgets without logging prompts.
- [x] Build `TradingTool.tsx`, `ToolPage.tsx`, `page.module.css` and the three localized `page.tsx` entry points. Include explicit mock/live selection, editable live inputs, reset, loading/error states, probability bars and expandable JSON.
- [x] Implement the clarified sharing behavior with validation and visible source labeling; verify no implicit publication or automatic model call.
- [x] Add Tools to the existing shared footer, add actual routes to sitemap, and update only the privacy/data-flow and local setup documentation needed for this tool.
- [x] Run focused tests, `bun run build`, the existing SEO check and new tool HTTP checks. Verify browser flows, a narrow mobile viewport, footer navigation and console errors. Leave the local server running and open the Chinese tool for the user.

## Verification commands

```sh
cd web
bun test scripts/ask-jev-trading.test.ts scripts/ask-jev-route.test.ts scripts/faq-navigation.test.tsx
bun run build
bun run start --hostname 127.0.0.1 --port 3010
FAQ_BASE_URL=http://127.0.0.1:3010 bun run check:seo
```

Live TypeSafe inference requires a dedicated credential; simulated transport tests verify the adapter without making paid calls. Local preview uses clearly labeled mock fixtures by default.

## Verification record

Production build, 24 focused/regression tests, existing FAQ SEO checks and new three-language tool HTTP checks passed. Browser checks covered all three mock modes, conclusion-only link reception, participation link, English language navigation/refresh/back, live-disabled guidance, and a 390 px mobile viewport with no horizontal overflow. Browser console had no errors or warnings. Real TypeSafe inference was not run because no dedicated key is configured. The local server remains on port 3010; no production deployment occurred.

## Educational prototype revision

The user replaced the live/mock switch with one editable example flow. Every submission now returns random, mathematically consistent Jev-format demo data, never real inference. Result explanations teach Noul, argmax Choice and probability-weighted Score. Source labels and conclusion-only sharing remain. The previous key/paid-inference plan is superseded for this stage.
