import { experimental_evaluate } from "ai";
import { typeSafeAi } from "@ai-sdk/typesafe-ai";
import { config } from "./config";

/** Models answer buy or sell. `hold` only appears on late blocks (no decision was made). */
export type Action = "buy" | "sell" | "hold";

/** What the model sees. Compact, relative, human-readable. */
export interface TradeState {
  market: string;
  venue?: string;
  baseAsset?: string;
  quoteAsset?: string;
  block: number;
  horizonBlocks: number; // the question is about the move over this many blocks
  blockMs: number;
  mid: number;
  spreadBps: number;
  bookImbalance: number; // -1 (all asks) .. 1 (all bids), within 1% of mid
  /** Cumulative resting MON within 10/25/50 bps of mid, per side. */
  depth: { [band: string]: { bid: number; ask: number } };
  /** Top 5 levels each side, best first, as "price x size". */
  book: { bids: string[]; asks: string[] };
  returnsBps: { last1: number; last5: number; last20: number; last100: number };
  recentMids: string; // oldest..newest, sampled every 5 blocks over the horizon, space separated
  /** Taker prints over the last `horizonBlocks`. cvdMon = taker buy volume - taker sell volume. */
  trades: { count: number; buyMon: number; sellMon: number; cvdMon: number; vwap: number | null; lastPrice: number | null; lastSide: "buy" | "sell" | null };
  recentTrades: string[]; // newest last, "block side size @ price"
  allowed: { buy: boolean; sell: boolean };
}

export interface Decision {
  action: Action;
  probabilities: Record<Action, number>;
  upIn10: number;
  latencyMs: number;
  inputTokens: number;
  trace?: ModelTrace;
}

/** Per-call input/output snapshots stored separately from risk-adjusted execution decisions. */
export interface ModelTrace {
  source: "jev" | "simulation";
  model: string;
  input: { state: TradeState; questions?: unknown };
  output: unknown;
}

export interface Model {
  readonly name: string;
  decide(state: TradeState): Promise<Decision>;
}

const QUESTIONS = {
  direction: {
    type: "choice",
    instructions: {
      question: "Will the base asset in `market` be higher or lower than the current mid after `horizonBlocks` more observations?",
      goal: "Choose a side for a post-only limit order on `venue` in `market`. Predict the base asset relative to the quote asset over `horizonBlocks` observations, approximately `horizonBlocks * blockMs` milliseconds. Account for the spread, fees, adverse price moves after a fill, and the allowed inventory constraints.",
      timing: "The order rests on the book until a taker fills it or it is replaced. Placement does not guarantee execution. This is not an immediate market order.",
      inputs: "Use `trades.cvdMon` (taker buys minus taker sells in base-asset units), `trades.lastSide`, `recentTrades`, `depth`, `book`, `returnsBps` and `recentMids`. Quote only on a side allowed by `allowed`; if neither side is allowed, the executor places no order.",
    },
    criteria: {
      buy: "Post a bid for the base asset: favor upward future prices and avoid fills immediately before a price fall. Respect allowed.buy.",
      sell: "Post an ask for the base asset: favor downward future prices and avoid fills immediately before a price rise. Respect allowed.sell.",
    },
  },
} as const;

/** Real Jev via the AI SDK. Swap-in is the MODEL env var. */
export class JevModel implements Model {
  readonly name = config.jevModelId;
  private model = typeSafeAi.evaluationModel(config.jevModelId);

  async decide(state: TradeState): Promise<Decision> {
    const t0 = performance.now();
    // Snapshot inputs before calling so later market or parent-object changes cannot alter history.
    const input = structuredClone({ state, questions: QUESTIONS });
    const r = await experimental_evaluate({ model: this.model, state: input.state as any, questions: input.questions, maxRetries: 0 });
    const a = r.answers.direction;
    const p = a.probabilities ?? { buy: 0, sell: 0, [a.choice]: 1 };
    const buy = p.buy ?? 0, sell = p.sell ?? 0;
    return {
      action: a.choice as Action,
      probabilities: { buy, sell, hold: 0 },
      upIn10: buy,
      latencyMs: performance.now() - t0,
      inputTokens: r.usage?.inputTokens ?? 0,
      // Keep only answers and usage, excluding transport details such as SDK headers and provider metadata.
      trace: { source: "jev", model: this.name, input, output: structuredClone({ answers: r.answers, usage: r.usage }) },
    };
  }
}

/** Deterministic stand-in: momentum + imbalance + mean reversion toward flat. */
export class MockModel implements Model {
  readonly name = "mock";

  async decide(state: TradeState): Promise<Decision> {
    const t0 = performance.now();
    // The mock model has no Jev request or questions; record only the actual state and result of this call.
    const input = { state: structuredClone(state) };
    state = input.state;
    // momentum + book imbalance + noise, pulled back toward flat so it trades both ways
    const flow = state.trades.buyMon + state.trades.sellMon ? state.trades.cvdMon / (state.trades.buyMon + state.trades.sellMon) : 0;
    const signal = state.returnsBps.last20 / 8 + state.bookImbalance * 1.5 + flow * 2 + this.noise(state.block);
    const buy = 1 / (1 + Math.exp(-signal)); // binary softmax
    const probabilities = { buy, sell: 1 - buy, hold: 0 };
    const action: Action = buy >= 0.5 ? "buy" : "sell";
    await Bun.sleep(80); // stand in for inference time so the pipeline behaves like production
    const decision: Decision = {
      action, probabilities,
      upIn10: buy,
      latencyMs: performance.now() - t0,
      inputTokens: Math.round(JSON.stringify(state).length / 4),
    };
    return { ...decision, trace: { source: "simulation", model: this.name, input, output: structuredClone(decision) } };
  }

  private noise(block: number) {
    let h = block * 2654435761 >>> 0;
    h ^= h >>> 15; h = (h * 2246822519) >>> 0; h ^= h >>> 13;
    return ((h % 1000) / 1000 - 0.5) * 3;
  }
}

export const createModel = (): Model => (config.model === "jev" ? new JevModel() : new MockModel());
