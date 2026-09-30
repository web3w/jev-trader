# JEVM brand site

Static, bilingual brand site for `jevm.ai`. It is independent of the Jev Trader dashboard and has no build step.

Preview from the repository root:

```sh
python3 -m http.server 4173 --directory jevm-site
```

Open `http://127.0.0.1:4173/` for the default English experience. Chinese is an explicit alternative at `http://127.0.0.1:4173/zh/`; neither browser language nor stored preferences redirect visitors.

The hero takes compositional inspiration from MotionSites' free **Space planet** template. Its interactive JEVM core is an original, dependency-free WebGL scene, not a template video or an imported paid asset. Five ray-traced asset planets revolve on inclined orbits, with perspective scaling and real core occlusion. Drag (or use arrow keys) to change the viewpoint. A label follows the selected/hovered planet; a fixed selector keeps every market accessible even while its planet is behind the core. Planets also accept pointer selection. Hovering a planet or hovering/focusing a market selector suspends the cycle.

Each asset planet has a depth-tested atmospheric glow and tilted light ring in its own color. Ring highlights share the orbit clock, so pause, reduced motion and background suspension also stop them. Selection, pointer hover and keyboard focus emphasize the corresponding halo; the fixed asset selectors echo those rings without adding an independent animation.

A 30-second illustrative loop connects six stages: market-state input, Jev classification, asset/action selection, independent policy checks, EVM contract execution, and receipt/state feedback. Blue packets indicate inputs and decisions; gold packets indicate execution and feedback. Select a step to pause and read it, use Play/Pause to control the cycle, or Replay to reset. Classification labels are scripted examples, not model outputs; the controls never connect a wallet or submit a transaction. Eligibility is separate from the buy/sell/hold/skip decision. The policy stage describes both allow/block outcomes while the animation depicts the allowed branch.

Reduced-motion preferences disable automatic movement. Keyboard focus on the canvas, asset selectors or workflow steps also suspends playback. Rendering pauses offscreen and in background tabs, with a 30 fps target and capped pixel density. A static sphere and working market/workflow selectors remain when WebGL is unavailable. Both languages keep their market descriptions in the initial HTML. Pointer picking uses the shader's sphere radii and nearest-hit depth test, including when two planets overlap.

The compact headline and explanatory section distinguish JEV decision intelligence from the EVM smart-contract execution environment. The warmer orbit identifies execution; the central sphere carries the JEVM intelligence-runtime brand. JEV remains the model name in the workflow. The integration is presented as a vision, not a delivered capability.

News is a manually curated selection of dated primary sources, not a live feed. Each entry separates the reported development from JEVM's editorial interpretation, links to the source, and avoids implying endorsement. Update English and Chinese together when refreshing the selection; the displayed curation date must reflect an actual source review.

Checks: `node --test scripts/jevm-site.test.mjs` and `node --check jevm-site/assets/universe.js` from the repository root. Tests cover bilingual initial HTML, workflow controls, news sources, orbit geometry, cycle timing and shader name collisions. Browser checks should include actual WebGL initialization, moving planets, all six stages, market selection, drag, pause/replay, keyboard use, mobile overflow, and language switching.

## Cloudflare deployment

The site deploys independently as the assets-only Cloudflare Worker `jevm-site`, with `jevm.ai` configured as its custom domain. Cloudflare manages the domain's website DNS record and HTTPS certificate. Existing email records are not part of this deployment. No trading backend, application secrets, build output or Node runtime is uploaded.

With Wrangler authenticated to the account in `wrangler.jsonc`, run from the repository root:

```sh
node --test scripts/jevm-site.test.mjs
wrangler deploy --config jevm-site/wrangler.jsonc --dry-run
wrangler deploy --config jevm-site/wrangler.jsonc
```

`.assetsignore` permits only the public HTML, assets, robots and sitemap files. English is served at `https://jevm.ai/` and Chinese at `https://jevm.ai/zh/`. Missing paths return 404 rather than falling back to the homepage. Verify both languages, animation resources, HTTPS and a missing URL after each deployment. Do not deploy the separate `web/` dashboard or restart the trading backend as part of this workflow.

The site intentionally labels the cross-asset trader network as a vision and links to the separate simulated Jev Trader demonstration for current, inspectable work.
