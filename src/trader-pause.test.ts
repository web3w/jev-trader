import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Trader } from "./trader";
import type { Market } from "./market";
import type { Decision, Model } from "./model";

test("resume immediately after pausing; stale model requests cannot place orders or release the new request's lock", async () => {
  const cwd = process.cwd();
  const temp = mkdtempSync(join(tmpdir(), "jev-pause-"));
  process.chdir(temp);
  try {
    const pending: ((decision: Decision) => void)[] = [];
    const model: Model = { name: "mock", decide: () => new Promise((resolve) => pending.push(resolve)) };
    let quotes = 0;
    const market = {
      wallet: null,
      pollPending: async () => [],
      readBook: async () => ({ block: 1, bid: 1, ask: 2, mid: 1.5, spreadBps: 6666, imbalance: 0, levels: { bids: [[1, 100]], asks: [[2, 100]] }, depthBps: {} }),
      send: async () => { quotes++; return { side: "buy", price: 1, size: 200, txHash: null, gasMon: 0, cancel: [], status: "sim", orderId: null, capped: false }; },
    } as unknown as Market;
    const trader = new Trader(market, model, () => {});
    const first = trader.onBlock(1);
    await Bun.sleep(0);
    trader.pause();
    const second = trader.onBlock(2);
    await Bun.sleep(0);
    expect(pending.length).toBe(2);
    const decision: Decision = { action: "buy", probabilities: { buy: 1, sell: 0, hold: 0 }, upIn10: 1, latencyMs: 1, inputTokens: 0 };
    pending[0]!(decision);
    await first;
    await trader.onBlock(3);
    expect(pending.length).toBe(2);
    expect(quotes).toBe(0);
    pending[1]!(decision);
    await second;
    expect(quotes).toBe(1);
  } finally {
    process.chdir(cwd);
    rmSync(temp, { recursive: true, force: true });
  }
});
