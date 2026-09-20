import { config } from "./config";
import { startBlockFeed } from "./chain";
import { Market } from "./market";
import { createModel } from "./model";
import { Trader } from "./trader";
import { log10 } from "./book";
import { startServer } from "./server";
import { Sessions } from "./sessions";
import type { TradingSession } from "./session";
import { HyperliquidSession } from "./hyperliquid";

const market = new Market();
const model = createModel();

let server: ReturnType<typeof startServer> | undefined;
let lastKuruUpdate = Date.now();
const trader = new Trader(
  market,
  model,
  (e, t) => {
    lastKuruUpdate = Date.now();
    if (kuru.meta.marketStatus !== "live") {
      kuru.meta.marketStatus = "live";
      server?.broadcastMeta("kuru");
    }
    server?.broadcast("kuru", e);
    if (e.decision && !e.decision.late) {
      const p = e.decision.probabilities;
      const q = e.quote;
      const quote = !q ? " NO QUOTE (cap or funds on both sides)" : ` ${q.side.toUpperCase()} ${q.size} @ ${q.price.toFixed(6)}${q.capped ? " capped" : ""}${q.status === "sim" ? " (sim)" : ` cancel ${q.cancel.length} ${q.txHash}`}`;
      console.log(`#${e.block} ${e.mid.toFixed(6)} b${(p.buy * 100).toFixed(0)} s${(p.sell * 100).toFixed(0)} ${e.decision.latencyMs}ms${quote} pnl $${e.totals.pnlUsd}${t ? ` · read ${t.readMs}ms loop ${t.loopMs}ms` : ""}`);
    }
  },
  (block, fill) => {
    server?.broadcastFill("kuru", block, fill);
    console.log(`#${block} FILL ${fill.side} ${fill.size} @ ${fill.price.toFixed(6)}${fill.simulated ? " (sim)" : ` order ${fill.orderId} ${fill.txHash}`}`);
  },
  (block, quote) => {
    server?.broadcastQuote("kuru", block, quote);
    if (quote.status !== "placed") console.log(`#${block} ${quote.status.toUpperCase()} ${quote.side} @ ${quote.price.toFixed(6)} gas ${quote.gasMon.toFixed(6)} MON ${quote.txHash}`);
  },
);
let stopKuruFeed: (() => void) | undefined;
let kuruStatusTimer: ReturnType<typeof setInterval> | undefined;
const kuru: TradingSession = {
  // Expose only market information, never RPC credentials or wallet keys to the browser.
  meta: {
    venue: "kuru", revision: 0, model: model.name, wallet: market.address,
    dryRun: config.dryRun, market: config.market, chainId: config.chainId,
    marginAccount: config.marginAccount, startedAt: Date.now(),
    symbol: "MON/USDC", baseAsset: "MON", quoteAsset: "USDC",
    marketUrl: `https://monadvision.com/address/${config.market}`, marketStatus: "connecting",
  },
  history: trader.history,
  async start() {
    if (stopKuruFeed) return;
    // Initialize on the first Kuru visit so the default market does not depend on Monad connectivity.
    if (!market.params) await market.init();
    kuru.meta.marketStatus = "connecting";
    lastKuruUpdate = Date.now();
    trader.attachTradeFeed(log10(market.params.sizePrecision));
    stopKuruFeed = startBlockFeed((block) => { void trader.onBlock(block); });
    kuruStatusTimer = setInterval(() => {
      if (Date.now() - lastKuruUpdate > 15_000 && kuru.meta.marketStatus !== "reconnecting") {
        kuru.meta.marketStatus = "reconnecting";
        server?.broadcastMeta("kuru");
      }
    }, 5000);
  },
  stop() {
    stopKuruFeed?.();
    stopKuruFeed = undefined;
    clearInterval(kuruStatusTimer);
    trader.pause();
  },
};
const hyperliquid = new HyperliquidSession(
  model,
  (event) => server?.broadcast("hyperliquid", event),
  () => server?.broadcastMeta("hyperliquid"),
);
const sessions = new Sessions({ kuru, hyperliquid });
server = startServer(sessions);
// Keep the API available if the default market is temporarily unavailable so pages can retry and Kuru can start independently.
try { await sessions.ensureStarted("hyperliquid"); }
catch { console.error("Hyperliquid unavailable at startup; retry from its market page."); }
console.log(`jev-trader | model=${model.name} | DRY RUN | Hyperliquid HYPE/USDC | :${config.port}`);
