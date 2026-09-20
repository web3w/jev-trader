# Market-specific page routes

Goal: give Hyperliquid HYPE/USDC and Kuru MON/USDC separate URLs, without mixing feeds during refresh, browser navigation or simultaneous visits.

Use lowercase, hyphenated canonical paths for the two integrated markets: `/hyperliquid-hype-usdc` and `/kuru-mon-usdc`. Redirect the home page to `/hyperliquid-hype-usdc`; redirect legacy `/hyperliquid/HYPE/USDC` and `/kuru/MON/USDC` URLs to their new paths. Next returns 404 for unknown pairs. Both fixed market routes share MarketDashboard, with standard links using canonical paths.

1. Sessions manages simulations by market. POST /venue starts only the target without stopping the other market; concurrent requests share one startup, failures can retry, and automatic startup rejects live sessions.
2. Isolate snapshots, history and SSE with the venue query parameter. Clients receive only their subscribed market's events; initialize revision to prevent stale data from overwriting a restarted session.
3. Pass the route's venue to useFeed, start the target before subscribing, cancel stale requests and preserve event deduplication. Reset frontend display when switching pages.
4. Verify session concurrency and isolation tests, production build, default home routing, direct new URLs, legacy redirects, refresh, back/forward navigation, simultaneous pages and invalid-pair 404 responses.

Scope: add no new chains or pairs and do not change the model or quoting algorithm. Markets retain separate simulated accounts and history in process memory, resetting when the service restarts.

Recorded verification: 17 tests and 102 assertions passed, covering concurrent-start deduplication, failure retries, live-trading protection and real SSE isolation by market. Backend type checking, frontend production build and diff checks passed. After restarting local services, browser checks covered the home redirect, market links, refresh, back/forward navigation, independent tabs with continuing updates and unsupported-pair 404 responses. The pages displayed HyperCore and Monad blocks with their respective simulation records; navigation styling was correct.
