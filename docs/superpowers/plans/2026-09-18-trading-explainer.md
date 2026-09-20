# Trading workflow explanation below the dashboard

Goal: explain model inputs and the trading workflow below the dashboard, with a pausable animation in English, Korean and Chinese.

Approach: preserve the dashboard's initial viewport height, add a separate explanation card below it and allow page scrolling. Show four steps: market data, decision, quote and fill feedback. CSS animation illustrates data flow only and explicitly does not replay actual orders. Use existing metadata for the current market, mock/Jev and simulation/live explanations.

1. Add the TradingExplainer component and styles: complete four-step flow, pause/play control, reduced-motion support, input list and limitations.
2. Add three-language copy to the existing dictionary, integrate the page and remove the desktop scrolling restriction without changing trading logic.
3. Verify the production build, browser language and market switching, 390px and desktop layouts, pause/play controls and animation states.

Acceptance: do not describe the mock as calling Jev or the animation as live fills. Do not claim that balance, fee rate or actual HyperCore block height is a model input. All content must be reachable by scrolling without horizontal overflow on mobile.

Recorded verification: production build and TypeScript passed. Chinese, English, Korean and Kuru/Hyperliquid switching were checked in the browser. No horizontal overflow at 1280px or 390px. Pausing set CSS animation state to paused; resuming set it to running. Static reduced-motion styles were retained. Only the frontend was restarted, preserving backend simulation records.
