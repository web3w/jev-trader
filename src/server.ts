import { config } from "./config";
import type { Fill, Quote } from "./market";
import type { BlockEvent } from "./trader";
import type { Sessions } from "./sessions";
import type { Venue } from "./session";

const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET, POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

/** GET / snapshot · GET /history recent blocks · GET /events SSE stream (`snapshot`, `block`, `quote`, `fill`, `ping`) */
export function startServer(sessions: Sessions, port = config.port) {
  const clients = new Map<ReadableStreamDefaultController<Uint8Array>, Venue>();
  const enc = new TextEncoder();
  const send = (c: ReadableStreamDefaultController<Uint8Array>, type: string, data: unknown) => {
    try { c.enqueue(enc.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)); } catch { clients.delete(c); }
  };
  const heartbeat = setInterval(() => clients.forEach((_venue, c) => send(c, "ping", Date.now())), 15_000);

  const broadcast = (venue: Venue, type: string, data: unknown) => clients.forEach((subscribed, c) => { if (subscribed === venue) send(c, type, data); });
  const server = Bun.serve({
    port,
    // Keep the timeout above the 15-second SSE heartbeat interval to avoid disconnects during quiet feeds.
    idleTimeout: 60,
    maxRequestBodySize: 1024,
    async fetch(req) {
      const { pathname, searchParams } = new URL(req.url);
      if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
      if (pathname === "/venue" && req.method === "POST") {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object" || !("venue" in body) || typeof body.venue !== "string") return json({ error: "invalid_venue" }, 400);
        try {
          const snapshot = await sessions.ensureStarted(body.venue);
          broadcast(snapshot.venue, "snapshot", snapshot);
          return json(snapshot);
        } catch (error) {
          const code = error instanceof Error ? error.message : "market_unavailable";
          const status = code === "invalid_venue" ? 400 : code === "live_switch_disabled" ? 409 : 502;
          if (body.venue === "kuru" || body.venue === "hyperliquid") broadcast(body.venue, "snapshot", sessions.snapshot(body.venue));
          return json({ error: status === 502 ? "market_unavailable" : code }, status);
        }
      }
      if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);
      if (pathname !== "/" && pathname !== "/history" && pathname !== "/events") return json({ error: "not found" }, 404);
      const venue = searchParams.get("venue") ?? "hyperliquid";
      if (venue !== "kuru" && venue !== "hyperliquid") return json({ error: "invalid_venue" }, 400);
      const session = sessions.get(venue);
      if (pathname === "/") return json({ ...session.meta, latest: session.history.at(-1) ?? null });
      if (pathname === "/history") return json(session.history);
      if (pathname === "/events") {
        let controller: ReadableStreamDefaultController<Uint8Array>;
        const stream = new ReadableStream<Uint8Array>({
          start(c) { controller = c; clients.set(c, venue); send(c, "snapshot", sessions.snapshot(venue)); },
          cancel() { clients.delete(controller); },
        });
        return new Response(stream, { headers: { ...CORS, "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" } });
      }
      return json({ error: "not found" }, 404);
    },
  });

  // Isolate market subscriptions and tag each event with its session lifecycle revision.
  const publish = (venue: Venue, type: string, data: object) => {
    broadcast(venue, type, { ...data, venue, revision: sessions.get(venue).meta.revision });
  };
  return {
    port: server.port,
    stop() {
      clearInterval(heartbeat);
      for (const c of clients.keys()) { try { c.close(); } catch {} }
      clients.clear();
      server.stop(true);
    },
    broadcast: (venue: Venue, e: BlockEvent) => publish(venue, "block", e),
    broadcastMeta: (venue: Venue) => publish(venue, "meta", sessions.get(venue).meta),
    /** A quote's receipt landed: placed (with order id) or reverted, and the real gas. */
    broadcastQuote: (venue: Venue, block: number, quote: Quote) => publish(venue, "quote", { block, quote }),
    /** A taker hit one of our resting orders in `block`. */
    broadcastFill: (venue: Venue, block: number, fill: Fill) => publish(venue, "fill", { block, fill }),
  };
}
