import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { HyperliquidSession, PaperSpot, findHypeMarket, type SpotMeta, type WsTrade } from "./hyperliquid";
import type { Decision, Model } from "./model";

const metadata: SpotMeta = {
  tokens: [{ index: 8, name: "USDC", szDecimals: 8 }, { index: 42, name: "HYPE", szDecimals: 2 }],
  universe: [{ name: "@999", index: 999, tokens: [42, 8] }],
};
const trade = (overrides: Partial<WsTrade> = {}): WsTrade => ({ coin: "@999", side: "A", px: "19", sz: "1", time: 101, tid: 1, hash: "0x1", ...overrides });

describe("HYPE spot paper trading", () => {
  test("resolves market and size precision by token identities, not array positions or a hardcoded index", () => {
    expect(findHypeMarket(metadata)).toEqual({ coin: "@999", szDecimals: 2 });
    expect(() => findHypeMarket({ ...metadata, universe: [] })).toThrow("HYPE/USDC");
  });

  test("does not sell unowned spot or exceed the 50 USDC inventory cap, and deducts maker fees", () => {
    const account = new PaperSpot();
    expect(account.place("sell", 20, 20, 2, 100)).toBeNull();
    for (let i = 0; i < 5; i++) {
      expect(account.place("buy", 20, 20, 2, 100 + i * 2)?.size).toBe(0.5);
      account.ingest(trade({ tid: i + 1, time: 101 + i * 2 }));
    }
    expect(account.base).toBe(2.5);
    expect(account.cash).toBeCloseTo(49.98);
    expect(account.feesUsd).toBeCloseTo(0.02);
    expect(account.place("buy", 20, 20, 2, 112)).toBeNull();
    const sell = account.place("sell", 22, 22, 2, 113);
    expect(sell?.size).toBe(0.46);
    account.ingest(trade({ side: "B", px: "23", sz: "99", tid: 20, time: 114 }));
    expect(account.base).toBeCloseTo(2.04);
    expect(account.cash).toBeGreaterThan(49.98);
    expect(account.cash).toBeGreaterThanOrEqual(0);
  });

  test("rounds up to the 10 USDC minimum without overdrawing cash or selling spot dust", () => {
    const account = new PaperSpot();
    const order = account.place("buy", 23, 23, 2, 100);
    expect(order?.size).toBe(0.44);
    expect(order!.price * order!.size).toBeGreaterThanOrEqual(10);
    account.cash = 10;
    expect(account.place("buy", 23, 23, 2, 101)).toBeNull();
    account.base = 0.1;
    expect(account.place("sell", 23, 23, 2, 102)).toBeNull();
  });

  test("only fills later opposite-side prints strictly through the price, excluding snapshots and duplicates", () => {
    const account = new PaperSpot();
    account.place("buy", 20, 20, 2, 100);
    expect(account.ingest(trade(), true)).toBeNull();
    expect(account.ingest(trade({ time: 99, tid: 2 }))).toBeNull();
    expect(account.ingest(trade({ side: "B", tid: 3 }))).toBeNull();
    expect(account.ingest(trade({ px: "20", tid: 4 }))).toBeNull();
    const first = trade({ sz: "0.1", tid: 5 });
    expect(account.ingest(first)?.size).toBe(0.1);
    expect(account.ingest(first)).toBeNull();
    expect(account.base).toBeCloseTo(0.1);
    expect(account.resting?.size).toBeCloseTo(0.4);
  });
});

const originalSocket = globalThis.WebSocket;
class FakeSocket {
  static latest: FakeSocket;
  static explorer: FakeSocket;
  static explorerCount = 0;
  readyState = 1;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    if (url === "wss://rpc.hyperliquid.xyz/ws") { FakeSocket.explorer = this; FakeSocket.explorerCount++; }
    else FakeSocket.latest = this;
    queueMicrotask(() => this.onopen?.());
  }
  send() {}
  close() { this.readyState = 3; this.onclose?.(); }
}
const sessions: HyperliquidSession[] = [];
afterEach(() => { for (const session of sessions.splice(0)) session.stop(); mock.restore(); globalThis.WebSocket = originalSocket; });

test("stop invalidates pending model results and retains the session history", async () => {
  spyOn(globalThis, "fetch").mockImplementation(Object.assign(async (_input: string | URL | Request, init?: RequestInit) => {
    const request = JSON.parse(String(init?.body));
    return Response.json(request.type === "spotMeta" ? metadata : {
      coin: "@999", time: Date.now(), levels: [[{ px: "20", sz: "100", n: 1 }], [{ px: "21", sz: "100", n: 1 }]],
    });
  }, { preconnect: globalThis.fetch.preconnect }));
  globalThis.WebSocket = FakeSocket as unknown as typeof WebSocket;
  let resolveDecision!: (decision: Decision) => void;
  const decide = mock(() => new Promise<Decision>((resolve) => { resolveDecision = resolve; }));
  const model: Model = { name: "mock", decide };
  const events = mock(() => {});
  const session = new HyperliquidSession(model, events, () => {});
  sessions.push(session);
  await session.start();
  FakeSocket.latest.onmessage?.({ data: JSON.stringify({ channel: "l2Book", data: {
    coin: "@999", time: Date.now() + 1, levels: [[{ px: "20", sz: "100", n: 1 }], [{ px: "21", sz: "100", n: 1 }]],
  } }) });
  await Bun.sleep(10);
  expect(decide).toHaveBeenCalledTimes(1);
  session.stop();
  resolveDecision({ action: "buy", probabilities: { buy: 1, sell: 0, hold: 0 }, upIn10: 1, latencyMs: 10, inputTokens: 0 });
  await Bun.sleep(10);
  expect(events).not.toHaveBeenCalled();
  expect(session.history).toEqual([]);
  expect(FakeSocket.latest.readyState).toBe(3);
});

test("switching away and back preserves filled inventory and history without replaying old prints", async () => {
  spyOn(globalThis, "fetch").mockImplementation(Object.assign(async (_input: string | URL | Request, init?: RequestInit) => {
    return Response.json(JSON.parse(String(init?.body)).type === "spotMeta" ? metadata : {
      coin: "@999", time: Date.now(), levels: [[{ px: "20", sz: "100" }], [{ px: "21", sz: "100" }]],
    });
  }, { preconnect: globalThis.fetch.preconnect }));
  globalThis.WebSocket = FakeSocket as unknown as typeof WebSocket;
  const model: Model = { name: "mock", decide: async () => ({ action: "buy", probabilities: { buy: 1, sell: 0, hold: 0 }, upIn10: 1, latencyMs: 0, inputTokens: 0 }) };
  const session = new HyperliquidSession(model, () => {}, () => {});
  sessions.push(session);
  const send = (channel: string, data: unknown) => FakeSocket.latest.onmessage?.({ data: JSON.stringify({ channel, data }) });
  const sendBook = () => send("l2Book", { coin: "@999", time: Date.now() + 1, levels: [[{ px: "20", sz: "100" }], [{ px: "21", sz: "100" }]] });
  await session.start();
  sendBook();
  await Bun.sleep(2);
  send("trades", []); // Exclude initial subscription history from fills.
  const print = trade({ time: Date.now() + 10, sz: "0.5" });
  send("trades", [print]);
  expect(session.history.at(-1)?.position.size).toBe(0.5);
  expect(session.history.at(-1)?.totals.tradingFeesUsd).toBeCloseTo(0.004);
  const count = session.history.length;
  session.stop();
  await session.start();
  expect(session.history.length).toBe(count);
  sendBook();
  await Bun.sleep(2);
  send("trades", [print]);
  expect(session.history.at(-1)?.position.size).toBe(0.5);
  expect(session.history.at(-1)?.totals.fills).toBe(1);
});

async function explorerSession(model: Model = { name: "mock", decide: async () => ({ action: "buy", probabilities: { buy: 1, sell: 0, hold: 0 }, upIn10: 1, latencyMs: 0, inputTokens: 0 }) }) {
  spyOn(globalThis, "fetch").mockImplementation(Object.assign(async (_input: string | URL | Request, init?: RequestInit) => {
    return Response.json(JSON.parse(String(init?.body)).type === "spotMeta" ? metadata : {
      coin: "@999", time: Date.now(), levels: [[{ px: "20", sz: "100" }], [{ px: "21", sz: "100" }]],
    });
  }, { preconnect: globalThis.fetch.preconnect }));
  globalThis.WebSocket = FakeSocket as unknown as typeof WebSocket;
  const status = mock(() => {});
  const session = new HyperliquidSession(model, () => {}, status);
  sessions.push(session);
  await session.start();
  return { session, status, sendBlocks: (data: { height: number; blockTime?: number }[]) => FakeSocket.explorer.onmessage?.({ data: JSON.stringify(data.map((block) => ({ blockTime: Date.now(), ...block }))) }), sendBook: () => FakeSocket.latest.onmessage?.({ data: JSON.stringify({ channel: "l2Book", data: { coin: "@999", time: Date.now() + 1, levels: [[{ px: "20", sz: "100" }], [{ px: "21", sz: "100" }]] } }) }) };
}

test("publishes the highest real HyperCore height without replacing local event IDs or going backwards", async () => {
  const { session, status, sendBlocks, sendBook } = await explorerSession();
  expect(FakeSocket.explorer).toBeDefined();
  sendBlocks([{ height: 1152999999, blockTime: Date.now() - 6_000 }]);
  expect(session.meta.latestBlock).toBeUndefined();
  sendBlocks([{ height: 1152000001 }, { height: 1152000005 }, { height: 1152000003 }, { height: Number.MAX_SAFE_INTEGER + 1 }, { height: -1 }]);
  expect(session.meta.latestBlock).toBe(1152000005);
  expect(status).toHaveBeenCalledTimes(1);
  sendBlocks([{ height: 1152000002 }, { height: 1.5 }]);
  expect(session.meta.latestBlock).toBe(1152000005);
  sendBlocks([{ height: 1152000006 }]);
  expect(status).toHaveBeenCalledTimes(1); // Frequent blocks update state; broadcast at most once per second.
  sendBook();
  await Bun.sleep(2);
  expect(session.history.at(-1)?.block).toBe(1);
  expect(session.history.at(-1)?.chainBlock).toBe(1152000006);
});

test("disconnect clears the real height instead of substituting an event ID, and stop cancels reconnection", async () => {
  const { session, sendBlocks, sendBook } = await explorerSession();
  expect(FakeSocket.explorer).toBeDefined();
  sendBlocks([{ height: 1152000010 }]);
  FakeSocket.explorer.close();
  expect(session.meta.latestBlock).toBeUndefined();
  sendBook();
  await Bun.sleep(2);
  expect(session.history.at(-1)?.block).toBe(1);
  expect(session.history.at(-1)?.chainBlock).toBeUndefined();
  const count = FakeSocket.explorerCount;
  session.stop();
  sendBlocks([{ height: 1152000011 }]);
  await Bun.sleep(1_600);
  expect(session.meta.latestBlock).toBeUndefined();
  expect(FakeSocket.explorerCount).toBe(count);
});

test("a HyperCore head older than five seconds is cleared", async () => {
  const { session, sendBlocks } = await explorerSession();
  expect(FakeSocket.explorer).toBeDefined();
  sendBlocks([{ height: 1152000020 }]);
  spyOn(Date, "now").mockReturnValue(Date.now() + 6_000);
  await Bun.sleep(1_100);
  expect(session.meta.latestBlock).toBeUndefined();
});

test("Hyperliquid forwards the current request and preserves pre-risk output; standalone fills have no model request", async () => {
  const model: Model = { name: "test-jev", decide: async (state) => ({
    action: "sell", probabilities: { buy: 0.2, sell: 0.8, hold: 0 }, upIn10: 0.2, latencyMs: 0, inputTokens: 0,
    trace: { source: "jev", model: "test-jev", input: { state: structuredClone(state), questions: { direction: "test" } }, output: { answers: { direction: { choice: "sell" } }, usage: { inputTokens: 0 } } },
  }) };
  const { session, sendBook } = await explorerSession(model);
  sendBook();
  await Bun.sleep(2);
  const event = session.history[0]!;
  expect(event.decision?.action).toBe("buy");
  expect(event.modelTrace?.input.state.market).toBe("HYPE-USDC");
  expect(event.modelTrace?.input.state.allowed).toEqual({ buy: true, sell: false });
  expect(event.modelTrace?.output).toMatchObject({ answers: { direction: { choice: "sell" } } });
  FakeSocket.latest.onmessage?.({ data: JSON.stringify({ channel: "trades", data: [] }) });
  FakeSocket.latest.onmessage?.({ data: JSON.stringify({ channel: "trades", data: [trade({ time: Date.now() + 10, sz: "0.5" })] }) });
  expect(session.history.at(-1)?.fill).not.toBeNull();
  expect(session.history.at(-1)?.decision).toBeNull();
  expect(session.history.at(-1)?.modelTrace).toBeUndefined();
  expect(event.modelTrace?.output).toMatchObject({ answers: { direction: { choice: "sell" } } });
});
