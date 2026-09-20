# Manual Kuru / Hyperliquid switching

**Goal:** a two-option header control switches the running feed and simulated strategy. Hyperliquid uses HYPE/USDC spot. Preserve the existing three languages and compact layout.

**Scope:** do not enable real-money trading. Hyperliquid reads public market data only, with no signing or order submission interface. Reject dynamic switching when Kuru is configured for live trading. Isolate history and simulated balances between markets; switching retains subscriptions and strategy execution only for the current market.

1. Implement the Hyperliquid simulation session: resolve the real market from spotMeta and read depth and trades; reuse model decisions with spot balance constraints. Verify market resolution, no uncovered selling, fees, duplicate trades and no orders from asynchronous decisions after stopping.
2. Implement backend session switching: validate the target, serialize switches, restore the original session on failure and send complete SSE snapshots. Verify rapid repeated requests, rollback, isolated history and simulation-only switching.
3. Add the frontend selector and loading/error states; clear the old chart before accepting a new snapshot. Update assets, instructions, units and footer dynamically. Verify three languages, keyboard focus, mobile overflow and refresh reflecting the backend's current market.
4. Run build, type checks and targeted tests; start local services and verify a full Kuru → Hyperliquid → Kuru switch with real public market data.

**File ownership:** backend adds src/hyperliquid.ts and tests; session protocol lives in src/session.ts. The primary agent owns entry point, server and switching tests; the frontend worker owns relevant pages and components under web/src.

**Recorded verification:** 11 targeted tests, backend type checks and frontend production build passed. Real public feeds completed Kuru → Hyperliquid → Kuru → Hyperliquid switching, with simulated fills and history restoration observed. An API disconnect displayed a switching failure and retained the original selection; restart accepted a new snapshot automatically. English, Korean and Chinese had no horizontal overflow at 1280px desktop or 390px mobile. The official trading page confirmed `/trade/HYPE/USDC` as the spot link; API market identifier `@107` cannot be used directly as a page path.
