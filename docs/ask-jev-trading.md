# Ask Jev Trading local preview

Run from `web`:

```sh
bun run build
bun run start --hostname 127.0.0.1 --port 3010
```

Open `http://127.0.0.1:3010/zh/tools/ask-jev-trading`. English and Korean pages live at `/tools/ask-jev-trading` and `/ko/tools/ask-jev-trading`.

## Educational prototype

The source-mode switch has been removed. Every mode starts with editable fictional trading data. Visitors can edit the question, snapshot and criteria and submit without credentials. Each submission draws new random demonstration data; it does not evaluate the text or call a model.

`POST /tools/ask-jev-trading/evaluate` returns `source: mock`, model label `jev-format-demo` and a typed answer. Noul draws a value in [0, 1). Choice normalizes positive random weights and picks the largest probability. Score uses the same distribution to compute the weighted level index and returns the actual level legend. Choice/Score demo confidence uses normalized entropy, explicitly labeled as an illustrative calculation rather than TypeSafe's unpublished formula.

The endpoint validates input and caps bodies at 24 KB. Questions allow 500 characters, snapshots 6,000, Choice 2–8 options and Score 2–10 levels, each up to 160 characters. It does not use `ASK_JEV_API_KEY`, contact TypeSafe or require a request quota for paid inference. Requests are processed in memory without application-level prompt logging or persistence.

The result explains the selected primitive and, for Score, shows the probability-weighted calculation. Expanding input/output shows `state`, `questions`, `instructions`, `criteria` and the generated response. Input/output is visible only in the tool; sharing still excludes it.

References checked on 2026-09-21: https://docs.typesafe.ai/primitives and https://docs.typesafe.ai/confidence.

## Conclusion-only sharing

Copy conclusion and Copy share link both include only a short conclusion and its mock/model source label, plus an invitation to try the tool. No question, snapshot, unselected options, rubric, complete probability distribution or raw response is serialized. A Choice conclusion necessarily includes the selected option's text; review it before sharing.

The conclusion is encoded in a URL fragment. It is readable, not encrypted or signed; recipients see an explicit unverified shared-snapshot notice. Loading it never calls the model and never restores the sender's inputs. No share database, feed publication, account or automatic outbound social post is created. Localhost share links work only on the same machine until the frontend is separately deployed.

## Verification

```sh
cd web
bun test scripts/ask-jev-trading.test.ts scripts/ask-jev-route.test.ts scripts/ask-jev-share.test.ts scripts/faq-navigation.test.tsx
bun run build
FAQ_BASE_URL=http://127.0.0.1:3010 bun run check:seo
node scripts/check-ask-jev-seo.mjs
```

No deployment is part of this change. Preserve the existing trading backend process when deploying the frontend in a separate, authorized task.
