import assert from "node:assert/strict";

const base = process.env.FEED_BASE_URL ?? "https://jev-trader.com/api";
for (const venue of ["hyperliquid", "kuru"]) {
  const response = await fetch(`${base}/?venue=${venue}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200);
  const meta = await response.json();
  assert.equal(meta.venue, venue);
  assert.equal(meta.marketStatus, "live");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  const started = Date.now();
  try {
    const stream = await fetch(`${base}/events?venue=${venue}`, { signal: controller.signal });
    assert.equal(stream.status, 200);
    assert.ok(stream.headers.get("content-type")?.includes("text/event-stream"));
    const reader = stream.body.getReader();
    const decoder = new TextDecoder();
    let pending = "", snapshot = false, lastBlock = -1, updates = 0;
    while (updates < 2) {
      const chunk = await reader.read();
      assert.ok(!chunk.done, "stream must stay connected");
      pending += decoder.decode(chunk.value, { stream: true });
      let boundary;
      while ((boundary = pending.indexOf("\n\n")) !== -1) {
        const frame = pending.slice(0, boundary);
        pending = pending.slice(boundary + 2);
        const type = frame.match(/^event: (.+)$/m)?.[1];
        if (type !== "snapshot" && type !== "block") continue;
        const data = JSON.parse(frame.match(/^data: (.+)$/m)[1]);
        assert.equal(data.venue, venue);
        if (type === "snapshot") {
          assert.ok(data.history.length > 0);
          snapshot = true;
          lastBlock = Math.max(lastBlock, data.history.at(-1).block);
        } else if (snapshot && data.block > lastBlock) {
          lastBlock = data.block;
          updates++;
        }
      }
    }
    console.log(`PASS ${venue}: complete snapshot and ${updates} new blocks in ${Date.now() - started}ms`);
    await reader.cancel();
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
