import type { Book, Fill, Quote, Side } from "./market";
import type { Decision, Model, TradeState } from "./model";
import type { BlockEvent, Totals } from "./trader";
import type { Meta, TradingSession } from "./session";

const INFO = "https://api.hyperliquid.xyz/info";
const SOCKET = "wss://api.hyperliquid.xyz/ws";
const EXPLORER_SOCKET = "wss://rpc.hyperliquid.xyz/ws";
const STALE_MS = 5_000;
// Simulation uses the official base spot maker fee of 0.040%, without account discounts, charged in USDC equivalent.
// https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees
const MAKER_FEE = 0.0004;

export interface SpotMeta {
  tokens: { index: number; name: string; szDecimals: number }[];
  universe: { index: number; name: string; tokens: number[] }[];
}
export interface WsTrade { coin: string; side: "B" | "A"; px: string; sz: string; time: number; tid: number; hash: string }
interface WsBook { coin: string; time: number; levels: [{ px: string; sz: string }[], { px: string; sz: string }[]] }

export function findHypeMarket(meta: SpotMeta) {
  const token = (index: number | undefined) => meta.tokens.find((t) => t.index === index);
  const pair = meta.universe.find((p) => token(p.tokens[0])?.name === "HYPE" && token(p.tokens[1])?.name === "USDC");
  if (!pair) throw new Error("Hyperliquid HYPE/USDC spot market is unavailable");
  return { coin: pair.name, szDecimals: token(pair.tokens[0])!.szDecimals };
}

/** Single simulated spot account. Cancel orders, process fills and update balances synchronously so model waits do not lose old-order fills. */
export class PaperSpot {
  cash = 100;
  base = 0;
  costUsd = 0;
  feesUsd = 0;
  realizedUsd = 0;
  resting: { side: Side; price: number; size: number; time: number; id: number } | null = null;
  private orderId = 0;
  private seen = new Set<string>();

  size(side: Side, price: number, mid: number, decimals: number) {
    // The minimum spot notional is 10 USDC; round up to a valid size increment before checking balances and position limits.
    const size = Math.ceil(10 / price * 10 ** decimals - 1e-9) / 10 ** decimals;
    const available = side === "buy"
      ? Math.min(this.cash / (price * (1 + MAKER_FEE)), Math.max(0, 50 / mid - this.base))
      : this.base;
    return size <= available + 1e-12 ? size : 0;
  }

  place(side: Side, price: number, mid: number, decimals: number, time: number): Quote | null {
    this.cancel();
    const size = this.size(side, price, mid, decimals);
    if (size <= 0) return null;
    this.resting = { side, price, size, time, id: --this.orderId };
    return { side, price, size, orderId: this.orderId, txHash: null, gasMon: 0, cancel: [], status: "sim", capped: false };
  }

  cancel() { this.resting = null; }

  ingest(trade: WsTrade, snapshot = false): Fill | null {
    const key = `${trade.time}:${trade.coin}:${trade.tid}`;
    if (this.seen.has(key)) return null;
    this.seen.add(key);
    if (this.seen.size > 3_000) this.seen.delete(this.seen.values().next().value!);
    const order = this.resting;
    if (snapshot || !order || trade.time <= order.time) return null;
    const px = Number(trade.px), volume = Number(trade.sz);
    if (!Number.isFinite(px) || !Number.isFinite(volume) || volume <= 0) return null;
    // The official side identifies the taker: A sells through the bid, B buys through the ask; touching a price does not imply a queued fill.
    if (order.side === "buy" ? trade.side !== "A" || px >= order.price : trade.side !== "B" || px <= order.price) return null;
    const size = Math.min(order.size, volume);
    const notional = size * order.price, fee = notional * MAKER_FEE;
    if (order.side === "buy") {
      this.cash -= notional + fee;
      this.base += size;
      this.costUsd += notional;
    } else {
      const cost = this.costUsd * size / this.base;
      this.cash += notional - fee;
      this.base -= size;
      this.costUsd -= cost;
      this.realizedUsd += notional - cost;
    }
    this.feesUsd += fee;
    order.size -= size;
    if (order.size < 1e-9) this.resting = null;
    if (this.base < 1e-9) { this.base = 0; this.costUsd = 0; }
    return { side: order.side, size, price: order.price, orderId: order.id, txHash: null, simulated: true };
  }
}

export class HyperliquidSession implements TradingSession {
  readonly history: BlockEvent[] = [];
  readonly meta: Meta;
  private account = new PaperSpot();
  private socket: WebSocket | null = null;
  private chainSocket: WebSocket | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private retry: ReturnType<typeof setTimeout> | null = null;
  private chainRetry: ReturnType<typeof setTimeout> | null = null;
  private chainHeight = 0;
  private chainReceivedAt = 0;
  private announcedHeight: number | undefined;
  private chainAnnouncedAt = 0;
  private generation = 0;
  private active = false;
  private busy = false;
  private refreshing = false;
  private book: Book | null = null;
  private bookTime = 0;
  private decidedTime = 0;
  private lastDecisionAt = 0;
  private socketStartedAt = 0;
  private szDecimals = 0;
  private sequence = 0;
  private mids: number[] = [];
  private prints: WsTrade[] = [];
  private totals: Totals = { blocks: 0, decisions: 0, quotes: 0, fills: 0, reverted: 0, lateBlocks: 0, jevUsd: 0, gasMon: 0, gasUsd: 0, realizedUsd: 0, pnlUsd: 0, pnlMon: 0, pnlPct: 0, tradingFeesUsd: 0 };

  constructor(private model: Model, private onEvent: (event: BlockEvent) => void, private onStatus: () => void) {
    this.meta = { venue: "hyperliquid", revision: 0, model: model.name, wallet: null, dryRun: true, market: "", chainId: null, marginAccount: null, startedAt: Date.now(), symbol: "HYPE/USDC", baseAsset: "HYPE", quoteAsset: "USDC", marketUrl: "https://app.hyperliquid.xyz", marketStatus: "connecting" };
  }

  async start() {
    if (this.active) return;
    this.active = true;
    const generation = ++this.generation;
    this.status("connecting");
    try {
      const market = findHypeMarket(await info<SpotMeta>({ type: "spotMeta" }));
      const initial = await info<WsBook>({ type: "l2Book", coin: market.coin });
      if (!this.active || generation !== this.generation) throw new Error("Hyperliquid session was stopped");
      this.meta.market = market.coin;
      // Official trading pages use pair paths; opening the API @index directly redirects to perpetuals.
      this.meta.marketUrl = "https://app.hyperliquid.xyz/trade/HYPE/USDC";
      this.szDecimals = market.szDecimals;
      this.bookTime = 0;
      if (!this.readBook(initial)) throw new Error("Hyperliquid order book is empty or stale");
      this.decidedTime = 0;
      this.lastDecisionAt = 0;
      this.connect(generation);
      this.connectChain(generation);
      this.timer = setInterval(() => {
        if (Date.now() - this.chainReceivedAt > STALE_MS) {
          this.clearChainHead();
          this.chainSocket?.close();
        } else if (this.meta.latestBlock !== this.announcedHeight && Date.now() - this.chainAnnouncedAt >= 1_000) {
          this.announcedHeight = this.meta.latestBlock;
          this.chainAnnouncedAt = Date.now();
          this.onStatus();
        }
        if (Date.now() - this.bookTime > 3_000) void this.refreshBook(generation);
        if (Date.now() - this.bookTime > STALE_MS) {
          this.account.cancel();
          this.status("reconnecting");
          if (Date.now() - this.socketStartedAt > STALE_MS) this.socket?.close();
        } else if (this.meta.marketStatus === "live") void this.tick(generation);
      }, 1_000);
    } catch (error) {
      if (generation === this.generation) this.stop();
      throw error;
    }
  }

  stop() {
    this.active = false;
    this.generation++;
    if (this.timer) clearInterval(this.timer);
    if (this.retry) clearTimeout(this.retry);
    if (this.chainRetry) clearTimeout(this.chainRetry);
    this.timer = null;
    this.retry = null;
    this.chainRetry = null;
    this.socket?.close();
    this.socket = null;
    this.chainSocket?.close();
    this.chainSocket = null;
    delete this.meta.latestBlock;
    this.announcedHeight = undefined;
    this.account.cancel();
    this.busy = false;
    this.refreshing = false;
    this.prints = [];
  }

  private async refreshBook(generation: number) {
    if (this.refreshing) return;
    this.refreshing = true;
    try {
      const book = await info<WsBook>({ type: "l2Book", coin: this.meta.market });
      if (!this.active || generation !== this.generation) return;
      // WebSocket still supplies trades; use public HTTP to refresh the book only when pushes are temporarily quiet.
      if (this.readBook(book) && this.socket?.readyState === 1) {
        this.status("live");
        void this.tick(generation);
      }
    } catch (error) { console.error("Hyperliquid book refresh:", (error as Error).message); }
    finally { if (generation === this.generation) this.refreshing = false; }
  }

  private status(status: Meta["marketStatus"]) {
    if (this.meta.marketStatus === status) return;
    this.meta.marketStatus = status;
    this.onStatus();
  }

  private clearChainHead() {
    if (this.meta.latestBlock === undefined) return;
    delete this.meta.latestBlock;
    this.announcedHeight = undefined;
    this.onStatus();
  }

  private connectChain(generation: number) {
    if (!this.active || generation !== this.generation) return;
    // Subscribe separately to actual HyperCore blocks, without using HyperEVM heights or changing internal market event sequences.
    let socket: WebSocket;
    try { socket = new WebSocket(EXPLORER_SOCKET); }
    catch {
      this.chainRetry = setTimeout(() => this.connectChain(generation), 1_500);
      return;
    }
    this.chainSocket = socket;
    this.chainReceivedAt = Date.now();
    const current = () => this.active && generation === this.generation && socket === this.chainSocket;
    socket.onopen = () => {
      if (!current()) { socket.close(); return; }
      socket.send(JSON.stringify({ method: "subscribe", subscription: { type: "explorerBlock" } }));
    };
    socket.onmessage = (event) => {
      if (!current()) return;
      try {
        const blocks = JSON.parse(String(event.data));
        if (!Array.isArray(blocks)) return;
        let height = this.chainHeight;
        let blockTime = this.chainReceivedAt;
        for (const block of blocks) {
          const age = Date.now() - block?.blockTime;
          if (Number.isSafeInteger(block?.height) && block.height > height && Number.isFinite(block?.blockTime) && age >= -1_000 && age <= STALE_MS) {
            height = block.height;
            blockTime = block.blockTime;
          }
        }
        if (height === this.chainHeight) return;
        this.chainHeight = height;
        // Check freshness by chain time so newly received old snapshots are not treated as live chain heads.
        this.chainReceivedAt = blockTime;
        this.meta.latestBlock = height;
        // Show the first chain head immediately; coalesce later frequent pushes into one broadcast per second.
        if (this.announcedHeight === undefined) {
          this.announcedHeight = height;
          this.chainAnnouncedAt = Date.now();
          this.onStatus();
        }
      } catch { /* Non-block messages do not affect the market session. */ }
    };
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (!current()) return;
      this.chainSocket = null;
      this.clearChainHead();
      this.chainRetry = setTimeout(() => this.connectChain(generation), 1_500);
    };
  }

  private connect(generation: number) {
    if (!this.active || generation !== this.generation) return;
    const socket = new WebSocket(SOCKET);
    this.socket = socket;
    let initialTrades = true;
    const connectedAt = Date.now();
    this.socketStartedAt = connectedAt;
    socket.onopen = () => {
      if (!this.active || generation !== this.generation || socket !== this.socket) { socket.close(); return; }
      for (const type of ["l2Book", "trades"]) socket.send(JSON.stringify({ method: "subscribe", subscription: { type, coin: this.meta.market } }));
    };
    socket.onmessage = (event) => {
      if (!this.active || generation !== this.generation || socket !== this.socket) return;
      try {
        const message = JSON.parse(String(event.data));
        if (message.channel === "l2Book" && this.readBook(message.data)) {
          this.status("live");
          void this.tick(generation);
        } else if (message.channel === "trades" && Array.isArray(message.data)) {
          for (const trade of message.data as WsTrade[]) {
            if (trade.coin !== this.meta.market || trade.time <= connectedAt || Date.now() - trade.time > STALE_MS) continue;
            const duplicate = this.prints.some((p) => p.time === trade.time && p.tid === trade.tid);
            if (duplicate) continue;
            this.prints.push(trade);
            if (this.prints.length > 1_000) this.prints.shift();
            const fill = this.account.ingest(trade, initialTrades || Date.now() - this.bookTime > STALE_MS);
            if (fill && this.book) { this.totals.fills++; this.emit(this.book, null, null, fill); }
          }
          initialTrades = false;
        }
      } catch (error) { console.error("Hyperliquid market message:", (error as Error).message); }
    };
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (!this.active || generation !== this.generation || socket !== this.socket) return;
      this.account.cancel();
      this.status("reconnecting");
      this.retry = setTimeout(() => this.connect(generation), 1_500);
    };
  }

  private readBook(raw: WsBook) {
    if (raw.coin !== this.meta.market || !Number.isFinite(raw.time) || raw.time <= this.bookTime || Date.now() - raw.time > STALE_MS) return false;
    const levels = raw.levels.map((side) => side.map((l): [number, number] => [Number(l.px), Number(l.sz)]).filter(([p, s]) => Number.isFinite(p) && Number.isFinite(s) && p > 0 && s > 0));
    const bids = levels[0]!, asks = levels[1]!;
    if (!bids.length || !asks.length) return false;
    const bid = bids[0]![0], ask = asks[0]![0], mid = (bid + ask) / 2;
    if (bid >= ask) return false;
    const depth = (band: number) => ({ bid: bids.filter(([p]) => p >= mid * (1 - band / 10_000)).reduce((sum, [, s]) => sum + s, 0), ask: asks.filter(([p]) => p <= mid * (1 + band / 10_000)).reduce((sum, [, s]) => sum + s, 0) });
    const total = depth(100);
    this.book = { block: this.sequence + 1, bid, ask, mid, spreadBps: (ask - bid) / mid * 10_000, imbalance: total.bid + total.ask ? (total.bid - total.ask) / (total.bid + total.ask) : 0, levels: { bids: bids.slice(0, 5), asks: asks.slice(0, 5) }, depthBps: { "10": depth(10), "25": depth(25), "50": depth(50) } };
    this.bookTime = raw.time;
    return true;
  }

  private async tick(generation: number) {
    if (!this.active || generation !== this.generation || this.busy || !this.book || this.bookTime <= this.decidedTime || Date.now() - this.lastDecisionAt < 1_000 || Date.now() - this.bookTime > STALE_MS) return;
    this.busy = true;
    this.lastDecisionAt = Date.now();
    this.decidedTime = this.bookTime;
    this.mids.push(this.book.mid);
    if (this.mids.length > 400) this.mids.shift();
    try {
      const decision = await this.model.decide(this.state(this.book));
      // Discard model replies received after switching; disconnected or stale feeds must not place new orders.
      if (!this.active || generation !== this.generation || this.meta.marketStatus !== "live" || Date.now() - this.bookTime > STALE_MS) return;
      this.totals.decisions++;
      if (this.model.name !== "mock") this.totals.jevUsd += decision.inputTokens / 1e6 * 0.042;
      const book = this.book;
      const wanted: Side = decision.action === "sell" ? "sell" : "buy";
      const allowed = (side: Side) => this.account.size(side, side === "buy" ? book.bid : book.ask, book.mid, this.szDecimals) > 0;
      const other: Side = wanted === "buy" ? "sell" : "buy";
      const side = decision.action === "hold" ? null : allowed(wanted) ? wanted : allowed(other) ? other : null;
      this.account.cancel();
      const quote = side ? this.account.place(side, side === "buy" ? book.bid : book.ask, book.mid, this.szDecimals, Math.max(Date.now(), this.bookTime)) : null;
      if (quote) { quote.capped = side !== wanted; this.totals.quotes++; }
      this.emit(book, { ...decision, action: side ?? "hold" }, quote, null);
    } catch (error) { console.error("Hyperliquid decision:", (error as Error).message); }
    finally { if (generation === this.generation) this.busy = false; }
  }

  private state(book: Book): TradeState {
    const ret = (n: number) => { const old = this.mids[Math.max(0, this.mids.length - 1 - n)]!; return (book.mid / old - 1) * 10_000; };
    const prints = this.prints.filter((p) => p.time > Date.now() - 30_000);
    const buy = prints.filter((p) => p.side === "B").reduce((sum, p) => sum + Number(p.sz), 0);
    const sell = prints.filter((p) => p.side === "A").reduce((sum, p) => sum + Number(p.sz), 0);
    const last = prints.at(-1);
    return {
      market: "HYPE-USDC", venue: "hyperliquid", baseAsset: "HYPE", quoteAsset: "USDC", block: this.sequence + 1, horizonBlocks: 30, blockMs: 1_000,
      mid: book.mid, spreadBps: book.spreadBps, bookImbalance: book.imbalance, depth: book.depthBps,
      book: { bids: book.levels.bids.map(([p, s]) => `${p} x ${s}`), asks: book.levels.asks.map(([p, s]) => `${p} x ${s}`) },
      returnsBps: { last1: ret(1), last5: ret(5), last20: ret(20), last100: ret(100) }, recentMids: this.mids.slice(-30).join(" "),
      trades: { count: prints.length, buyMon: buy, sellMon: sell, cvdMon: buy - sell, vwap: buy + sell ? prints.reduce((sum, p) => sum + Number(p.px) * Number(p.sz), 0) / (buy + sell) : null, lastPrice: last ? Number(last.px) : null, lastSide: last ? last.side === "B" ? "buy" : "sell" : null },
      recentTrades: prints.slice(-10).map((p) => `${p.time} ${p.side === "B" ? "buy" : "sell"} ${p.sz} @ ${p.px}`),
      allowed: { buy: this.account.size("buy", book.bid, book.mid, this.szDecimals) > 0, sell: this.account.size("sell", book.ask, book.mid, this.szDecimals) > 0 },
    };
  }

  private emit(book: Book, decision: Decision | null, quote: Quote | null, fill: Fill | null) {
    const account = this.account;
    const unrealized = account.base * book.mid - account.costUsd;
    const pnl = account.cash + account.base * book.mid - 100 - this.totals.jevUsd;
    Object.assign(this.totals, { blocks: ++this.sequence, tradingFeesUsd: account.feesUsd, realizedUsd: account.realizedUsd - account.feesUsd, pnlUsd: pnl, pnlMon: pnl / book.mid, pnlPct: pnl });
    const event: BlockEvent = {
      block: this.sequence, ts: Date.now(), mid: book.mid, bestBid: book.bid, bestAsk: book.ask, spreadBps: book.spreadBps,
      // This is the chain head observed when recording, not a claimed fill block; leave it empty when unavailable.
      chainBlock: Date.now() - this.chainReceivedAt <= STALE_MS ? this.meta.latestBlock : undefined,
      decision: decision ? { action: decision.action, probabilities: decision.probabilities, upIn10: decision.upIn10, latencyMs: Math.round(decision.latencyMs), late: false } : null,
      modelTrace: decision?.trace,
      quote, fill, resting: { bidMon: account.resting?.side === "buy" ? account.resting.size : 0, askMon: account.resting?.side === "sell" ? account.resting.size : 0 },
      position: { side: account.base ? "long" : "flat", size: account.base, entryPrice: account.base ? account.costUsd / account.base : null, unrealizedUsd: unrealized, unrealizedMon: unrealized / book.mid }, totals: { ...this.totals },
    };
    this.history.push(event);
    if (this.history.length > 1_000) this.history.shift();
    this.onEvent(event);
  }
}

async function info<T>(body: object): Promise<T> {
  const response = await fetch(INFO, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Hyperliquid info HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
