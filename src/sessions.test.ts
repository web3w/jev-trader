import { expect, test } from "bun:test";
import { Sessions } from "./sessions";
import type { TradingSession, Venue } from "./session";

function session(venue: Venue, changes: Partial<TradingSession> = {}): TradingSession {
  return {
    meta: { venue, revision: 0, model: "mock", wallet: null, dryRun: true, market: venue, chainId: null, marginAccount: null, startedAt: 1, symbol: venue === "kuru" ? "MON/USDC" : "HYPE/USDC", baseAsset: venue === "kuru" ? "MON" : "HYPE", quoteAsset: "USDC", marketUrl: "", marketStatus: "connecting" },
    history: [], start() {}, stop() {}, ...changes,
  };
}

test("markets start independently; repeated requests neither restart nor clear another market's history", async () => {
  const calls: string[] = [];
  const kuru = session("kuru", { start() { calls.push("start kuru"); }, stop() { calls.push("stop kuru"); } });
  const hyperliquid = session("hyperliquid", { start() { calls.push("start hyperliquid"); }, stop() { calls.push("stop hyperliquid"); } });
  const sessions = new Sessions({ kuru, hyperliquid });
  const kuruRevision = sessions.snapshot("kuru").revision;
  const hyperRevision = sessions.snapshot().revision;
  expect(kuruRevision).toBeGreaterThan(0);
  expect(hyperRevision).toBeGreaterThan(0);
  expect(kuruRevision).not.toBe(hyperRevision);
  await sessions.ensureStarted("hyperliquid");
  await sessions.ensureStarted("kuru");
  await sessions.ensureStarted("hyperliquid");
  await sessions.ensureStarted("kuru");
  expect(calls).toEqual(["start hyperliquid", "start kuru"]);
  expect(sessions.get("kuru")).toBe(kuru);
  expect(sessions.snapshot("kuru").history).toEqual(kuru.history);
  expect(sessions.snapshot().history).toEqual(hyperliquid.history);
  expect(sessions.snapshot("kuru").revision).toBe(kuruRevision);
  expect(sessions.snapshot().revision).toBe(hyperRevision);
});

test("coalesce concurrent starts for the same market while allowing another market to start independently", async () => {
  let ready!: () => void;
  let calls = 0;
  const pending = new Promise<void>((resolve) => { ready = resolve; });
  const sessions = new Sessions({ kuru: session("kuru", { start() { calls++; return pending; } }), hyperliquid: session("hyperliquid") });
  const first = sessions.ensureStarted("kuru");
  const second = sessions.ensureStarted("kuru");
  await sessions.ensureStarted("hyperliquid");
  ready();
  const [a, b] = await Promise.all([first, second]);
  expect(calls).toBe(1);
  expect(a).toEqual(b);
});

test("startup failure clears only the failed target and allows subsequent retries", async () => {
  let attempts = 0, failedStops = 0, otherStops = 0;
  const sessions = new Sessions({
    kuru: session("kuru", { start() { if (++attempts === 1) throw Error("network"); }, stop() { failedStops++; } }),
    hyperliquid: session("hyperliquid", { stop() { otherStops++; } }),
  });
  await sessions.ensureStarted("hyperliquid");
  await expect(sessions.ensureStarted("kuru")).rejects.toThrow("market_unavailable");
  expect(failedStops).toBe(1);
  expect(otherStops).toBe(0);
  await sessions.ensureStarted("kuru");
  expect(attempts).toBe(2);
});

test("reject unknown markets and live page starts without calling any start or stop operations", async () => {
  let calls = 0;
  const kuru = session("kuru", { start() { calls++; }, stop() { calls++; } });
  kuru.meta.dryRun = false;
  const sessions = new Sessions({ kuru, hyperliquid: session("hyperliquid") });
  await expect(sessions.ensureStarted("other")).rejects.toThrow("invalid_venue");
  await expect(sessions.ensureStarted("kuru")).rejects.toThrow("live_switch_disabled");
  expect(() => sessions.get("other")).toThrow("invalid_venue");
  expect(calls).toBe(0);
});
