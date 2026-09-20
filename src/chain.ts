import { config } from "./config";

/** Raw JSON-RPC call over HTTP. Defaults to the send RPC; pass `config.readRpcUrl` for reads. */
export async function rpc<T = unknown>(method: string, params: unknown[] = [], url = config.rpcUrl): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(10_000),
  });
  const json = (await res.json()) as { result?: T; error?: { code: number; message: string } };
  if (json.error) throw new Error(`${method}: ${json.error.message} (${json.error.code})`);
  return json.result as T;
}

/**
 * Emits new block numbers, coalesced to the newest one.
 * Primary: WebSocket newHeads (fires when a block is Proposed).
 * Backstop: HTTP polling on the read RPC, so the loop keeps running if the socket drops.
 * A burst of heads in one tick runs the loop once, for the newest block only — never for a stale one.
 */
export function startBlockFeed(onBlock: (block: number) => void, pollMs = 150) {
  let last = 0, newest = 0, scheduled = false;
  let stopped = false, polling = false;
  let socket: WebSocket | null = null;
  let reconnect: ReturnType<typeof setTimeout> | undefined;
  const emit = (block: number) => {
    if (stopped || !Number.isFinite(block)) return;
    if (block <= last) return;
    last = newest = block;
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; if (!stopped) onBlock(newest); }, 0);
  };

  const poll = async () => {
    if (stopped || polling) return;
    polling = true;
    try { emit(parseInt(await rpc<string>("eth_blockNumber", [], config.readRpcUrl), 16)); } catch {}
    finally { polling = false; }
  };
  const interval = setInterval(poll, pollMs);
  poll();

  const connect = (delay = 0) => {
    if (stopped || !config.wsUrl) return;
    reconnect = setTimeout(() => {
      if (stopped) return;
      const ws = socket = new WebSocket(config.wsUrl!);
      ws.onopen = () => ws.send(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_subscribe", params: ["newHeads"] }));
      ws.onmessage = (e) => {
        try {
          const m = JSON.parse(String(e.data));
          if (m.method === "eth_subscription") emit(parseInt(m.params.result.number, 16));
        } catch {}
      };
      ws.onclose = () => connect(Math.min(delay + 1000, 10_000));
      ws.onerror = () => ws.close();
    }, delay);
  };
  connect();
  // Stop subscriptions and polling, ignoring in-flight requests so the previous market stops after switching.
  return () => {
    stopped = true;
    clearInterval(interval);
    clearTimeout(reconnect);
    socket?.close();
  };
}
