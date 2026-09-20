import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { typeSafeAi } from "@ai-sdk/typesafe-ai";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JevModel, MockModel, type TradeState } from "./model";
import { Trader } from "./trader";
import type { Market, Side } from "./market";

afterEach(() => mock.restore());

function state(): TradeState {
  return {
    market: "MON-USDC", venue: "Kuru", baseAsset: "MON", quoteAsset: "USDC", block: 1,
    horizonBlocks: 100, blockMs: 300, mid: 1.5, spreadBps: 2, bookImbalance: 0,
    depth: { "10bps": { bid: 100, ask: 200 } }, book: { bids: ["1 x 100"], asks: ["2 x 200"] },
    returnsBps: { last1: 0, last5: 0, last20: 0, last100: 0 }, recentMids: "1.5",
    trades: { count: 0, buyMon: 0, sellMon: 0, cvdMon: 0, vwap: null, lastPrice: null, lastSide: null },
    recentTrades: [], allowed: { buy: true, sell: false },
  };
}

function provider() {
  const result = {
    answers: { direction: { type: "choice" as const, choice: "sell", probabilities: { buy: 0.2, sell: 0.8 } } },
    usage: { inputTokens: 12, outputTokens: 4 }, warnings: [],
    response: { headers: { authorization: "private-header" }, body: { key: "private-provider-data" } },
    providerMetadata: { test: { secret: "private-metadata" } },
  };
  const doEvaluate = mock(async (_options: Parameters<ReturnType<typeof typeSafeAi.evaluationModel>["doEvaluate"]>[0]) => result);
  spyOn(typeSafeAi, "evaluationModel").mockReturnValue({
    specificationVersion: "v4", provider: "test", modelId: "test-jev", supportedQuestionTypes: ["choice"], doEvaluate,
  });
  return { result, doEvaluate };
}

test("Jev preserves independent snapshots of actual inputs and raw answers with only allowlisted fields", async () => {
  const { result, doEvaluate } = provider();
  const model = new JevModel();
  const input = state(), original = structuredClone(input);
  const pending = model.decide(input);
  input.depth["10bps"]!.bid = 999;
  input.book.bids.push("9 x 9");
  const decision = await pending;
  expect(decision.trace?.source).toBe("jev");
  expect(decision.trace?.model).toBe(model.name);
  expect(decision.trace?.input.state).toEqual(original);
  expect(JSON.stringify(doEvaluate.mock.calls[0]![0].state)).toBe(JSON.stringify(original));
  expect(decision.trace?.input.questions).toEqual(doEvaluate.mock.calls[0]![0].questions);
  expect(decision.trace?.output).toEqual({ answers: result.answers, usage: { inputTokens: 12, outputTokens: 4, totalTokens: 16 } });
  const saved = JSON.stringify(decision.trace);
  decision.action = "buy";
  decision.probabilities.sell = 0;
  result.answers.direction.choice = "buy";
  result.answers.direction.probabilities.sell = 0;
  result.usage.inputTokens = 999;
  expect(JSON.stringify(decision.trace)).toBe(saved);
  expect(saved).not.toContain("private-");
});

test("mock model records only actual state and simulated results without fabricating Jev questions", async () => {
  const model = new MockModel();
  const input = state(), original = structuredClone(input);
  const pending = model.decide(input);
  input.allowed.buy = false;
  input.depth["10bps"]!.bid = 999;
  const decision = await pending;
  const { trace, ...output } = decision;
  expect(trace?.source).toBe("simulation");
  expect(trace?.model).toBe("mock");
  expect(trace?.input).toEqual({ state: original });
  expect(trace?.output).toEqual(output);
  const saved = JSON.stringify(trace);
  decision.action = decision.action === "buy" ? "sell" : "buy";
  decision.probabilities.buy = 99;
  expect(JSON.stringify(trace)).toBe(saved);
});

function market(): Market {
  return {
    wallet: {}, margin: { mon: 0, usdc: 10_000 }, pollPending: async () => [],
    readBook: async () => ({ block: 1, bid: 1, ask: 2, mid: 1.5, spreadBps: 6666, imbalance: 0, levels: { bids: [[1, 100]], asks: [[2, 100]] }, depthBps: {} }),
    send: async (_block: number, side: Side) => ({ side, price: 1, size: 200, txHash: null, gasMon: 0, cancel: [], status: "sim", orderId: null, capped: side === "buy" }),
  } as unknown as Market;
}

test("Kuru records the current request and risk-adjusted actions preserve raw model output", async () => {
  const cwd = process.cwd(), temp = mkdtempSync(join(tmpdir(), "jev-trace-"));
  process.chdir(temp);
  try {
    const { result } = provider();
    const trader = new Trader(market(), new JevModel(), () => {});
    await trader.onBlock(1);
    const event = trader.history[0]!;
    expect(event.decision?.action).toBe("buy");
    expect(event.modelTrace?.input.state.market).toBe("MON-USDC");
    expect(event.modelTrace?.input.state.allowed).toEqual({ buy: true, sell: false });
    expect(event.modelTrace?.output).toMatchObject({ answers: { direction: { choice: "sell" } } });
    result.answers.direction.choice = "buy";
    expect(event.modelTrace?.output).toMatchObject({ answers: { direction: { choice: "sell" } } });
  } finally {
    process.chdir(cwd);
    rmSync(temp, { recursive: true, force: true });
  }
});

test("late Kuru records without a model call do not reuse the previous request", async () => {
  const cwd = process.cwd(), temp = mkdtempSync(join(tmpdir(), "jev-late-trace-"));
  process.chdir(temp);
  try {
    const trader = new Trader(market(), new MockModel(), () => {});
    await trader.onBlock(1);
    expect(trader.history[0]?.modelTrace).toBeDefined();
    const pending = trader.onBlock(2);
    await Bun.sleep(0);
    await trader.onBlock(3);
    expect(trader.history.at(-1)?.decision?.late).toBe(true);
    expect(trader.history.at(-1)?.modelTrace).toBeUndefined();
    await pending;
  } finally {
    process.chdir(cwd);
    rmSync(temp, { recursive: true, force: true });
  }
});
