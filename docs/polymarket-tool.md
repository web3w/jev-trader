# Jev for Polymarket

The tool lives at `/tools/polymarket`, `/zh/tools/polymarket` and `/ko/tools/polymarket`, with links in the footer's Tools section. Product name: **Jev for Polymarket**. Tagline: **From market rules to informed decisions.**

It adapts the [reference explorer](https://jev-market-lab.web3w.chatgpt.site/) into an editable request builder and manual scenario calculator. The Bitcoin, Anthropic and Fed examples preserve the reference's market links and September 20, 2026 quote timestamps. Rule summaries are attributed examples, not a replacement for checking the current complete rules.

Visitors can edit the question, rules, evidence, criteria, probabilities, prices and costs. Probabilities start blank. Request preview requires question, rules and evidence, plus valid criteria for Choice/Score. Copying a request does not execute it. Comparison uses percentages and cents per share, assuming a $1/$0 binary payout. Missing quotes stay missing, invalid distributions are not normalized, and changing inputs clears the result. Score is the weighted level index, not basis points.

There are no live quote requests, inference calls, wallet connections or orders. No credentials or paid API access are needed. Inputs stay in component state; only the existing language preference is remembered. Switching examples resets fields, and refreshing starts a new scenario.

## Local preview and checks

From `web`:

```sh
bun run build
bun run start --hostname 127.0.0.1 --port 3188
```

In another terminal, from the repository root:

```sh
bun test web/scripts/polymarket.test.ts web/scripts/faq-navigation.test.tsx
cd web
FAQ_BASE_URL=http://127.0.0.1:3188 bun run check:seo
FAQ_BASE_URL=http://127.0.0.1:3188 node scripts/check-polymarket-seo.mjs
FAQ_BASE_URL=http://127.0.0.1:3188 node scripts/check-ask-jev-seo.mjs
```

Browser regression checks: exercise all three cases, blank probabilities, invalid totals, a valid comparison, field editing, reset, request preview, language links, reload and back. In particular, choose Score, switch language, then go back: the pressed case button, question, rows and market link must agree. Native radio restoration caused a mismatch in this sequence, so the case selector uses buttons whose pressed state is derived from React state. Check mobile widths without page-wide overflow; wide tables and JSON scroll within their own containers.

This is a local frontend addition. Deployment and trading backend changes are outside this task.
