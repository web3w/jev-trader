import { afterEach, expect, test } from "bun:test";
import { Sessions } from "./sessions";
import { startServer } from "./server";
import type { TradingSession, Venue } from "./session";
import type { BlockEvent } from "./trader";

function session(venue: Venue, start = () => {}): TradingSession {
  return { meta: { venue, revision: 0, model: "mock", wallet: null, dryRun: true, market: venue, chainId: null, marginAccount: null, startedAt: 1, symbol: venue === "kuru" ? "MON/USDC" : "HYPE/USDC", baseAsset: venue === "kuru" ? "MON" : "HYPE", quoteAsset: "USDC", marketUrl: "", marketStatus: "connecting" }, history: [], start, stop() {} };
}
const servers: ReturnType<typeof startServer>[] = [];
afterEach(() => { for (const server of servers.splice(0)) server.stop(); });
function setup() {
  let starts = 0;
  const sessions = new Sessions({ kuru: session("kuru", () => { starts++; }), hyperliquid: session("hyperliquid", () => { starts++; }) });
  const server = startServer(sessions, 0);
  servers.push(server);
  return { sessions, server, starts: () => starts, url: `http://127.0.0.1:${server.port}` };
}
const next = async (reader: Pick<ReadableStreamDefaultReader<Uint8Array>, "read">) => new TextDecoder().decode((await reader.read()).value);
function event(block: number): BlockEvent {
  return { block, ts: 1, mid: 20, bestBid: 19, bestAsk: 21, spreadBps: 1, decision: null, quote: null, fill: null, resting: { bidMon: 0, askMon: 0 }, position: { side: "flat", size: 0, entryPrice: null, unrealizedUsd: 0, unrealizedMon: 0 }, totals: { blocks: 1, decisions: 0, quotes: 0, fills: 0, reverted: 0, lateBlocks: 0, jevUsd: 0, gasMon: 0, gasUsd: 0, realizedUsd: 0, pnlUsd: 0, pnlMon: 0, pnlPct: 0 } };
}

test("GET reads only the selected market; POST starts it idempotently; omitted venue defaults to Hyperliquid", async () => {
  const { sessions, starts, url } = setup();
  expect((await fetch(`${url}/`).then((r) => r.json()) as { venue: string }).venue).toBe("hyperliquid");
  expect((await fetch(`${url}/?venue=kuru`).then((r) => r.json()) as { venue: string }).venue).toBe("kuru");
  expect(starts()).toBe(0);
  for (const venue of ["kuru", "kuru", "hyperliquid"]) {
    const response = await fetch(`${url}/venue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venue }) });
    expect(response.status).toBe(200);
    expect((await response.json() as { venue: string }).venue).toBe(venue);
  }
  expect(starts()).toBe(2);
  expect(sessions.snapshot().venue).toBe("hyperliquid");
  expect((await fetch(`${url}/events?venue=unknown`)).status).toBe(400);
});

test("SSE snapshots, market data and metadata are fully isolated between markets", async () => {
  const { sessions, server, starts, url } = setup();
  const kuru = (await fetch(`${url}/events?venue=kuru`)).body!.getReader();
  const hyperliquid = (await fetch(`${url}/events`)).body!.getReader();
  expect(await next(kuru)).toContain('"venue":"kuru"');
  expect(await next(hyperliquid)).toContain('"venue":"hyperliquid"');
  expect(starts()).toBe(0);
  server.broadcast("kuru", event(111));
  server.broadcast("hyperliquid", event(222));
  const kuruBlock = await next(kuru), hyperBlock = await next(hyperliquid);
  expect(kuruBlock).toContain('"block":111');
  expect(kuruBlock).not.toContain('"venue":"hyperliquid"');
  expect(hyperBlock).toContain('"block":222');
  expect(hyperBlock).not.toContain('"venue":"kuru"');
  expect(kuruBlock).toContain(`"revision":${sessions.get("kuru").meta.revision}`);
  expect(hyperBlock).toContain(`"revision":${sessions.get("hyperliquid").meta.revision}`);
  server.broadcastMeta("kuru");
  server.broadcastMeta("hyperliquid");
  expect(await next(kuru)).toContain('"venue":"kuru"');
  expect(await next(hyperliquid)).toContain('"venue":"hyperliquid"');
  await kuru.cancel();
  await hyperliquid.cancel();
});

test("POST rejects invalid markets and live starts", async () => {
  const { sessions, starts, url } = setup();
  sessions.get("kuru").meta.dryRun = false;
  const post = (venue: string) => fetch(`${url}/venue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venue }) });
  expect((await post("other")).status).toBe(400);
  expect((await post("kuru")).status).toBe(409);
  expect(starts()).toBe(0);
});
