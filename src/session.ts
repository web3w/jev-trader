import type { BlockEvent } from "./trader";

export type Venue = "kuru" | "hyperliquid";
export type MarketStatus = "connecting" | "live" | "reconnecting";

export interface Meta {
  venue: Venue;
  revision: number;
  model: string;
  wallet: string | null;
  dryRun: boolean;
  market: string;
  chainId: number | null;
  marginAccount: string | null;
  startedAt: number;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  marketUrl: string;
  marketStatus: MarketStatus;
  /** Latest height from the official HyperCore block subscription; omitted when disconnected or stale. */
  latestBlock?: number;
}

export interface TradingSession {
  meta: Meta;
  history: BlockEvent[];
  start(): Promise<void> | void;
  stop(): Promise<void> | void;
}
