export type Action = "buy" | "sell" | "hold";
export type Side = "buy" | "sell";
export type Venue = "kuru" | "hyperliquid";
/** This block's post-only limit order. `sent` until its receipt lands, then `placed` or `reverted`. */
export interface Quote { side: Side; price: number; size: number; txHash: string | null; gasMon: number; cancel: number[]; status: "sent" | "placed" | "reverted" | "lost" | "sim"; orderId: number | null; capped: boolean }
/** A taker hit one of our resting orders. */
export interface Fill { side: Side; size: number; price: number; txHash: string | null; orderId: number; simulated: boolean }
export interface Decision { action: Action; probabilities: { buy: number; sell: number; hold: number }; upIn10: number; latencyMs: number; late: boolean }
export interface ModelTrace { source: "jev" | "simulation"; model: string; input: { state: unknown; questions?: unknown }; output: unknown }
export interface Position { side: "long" | "short" | "flat"; size: number; entryPrice: number | null; unrealizedUsd: number; unrealizedMon: number }
export interface Totals { blocks: number; decisions: number; quotes: number; fills: number; reverted: number; lateBlocks: number; jevUsd: number; gasMon: number; gasUsd: number; realizedUsd: number; pnlUsd: number; pnlMon: number; pnlPct: number }
export interface BlockEvent { venue: Venue; revision: number; block: number; chainBlock?: number; ts: number; mid: number; bestBid: number; bestAsk: number; spreadBps: number; decision: Decision | null; modelTrace?: ModelTrace; quote: Quote | null; fill: Fill | null; resting: { bidMon: number; askMon: number }; position: Position; totals: Totals }
export interface Meta { latestBlock?: number; revision: number; venue: Venue; symbol: string; baseAsset: string; quoteAsset: string; marketStatus: ConnectionState; marketUrl: string; model: string; wallet: string | null; dryRun: boolean; market: string; chainId: number | null; marginAccount: string | null; startedAt: number }
export type ConnectionState = "connecting" | "live" | "reconnecting";
export interface FeedState { meta: Meta | null; events: BlockEvent[]; latest: BlockEvent | null; connection: ConnectionState; avgLatencyMs: number }
