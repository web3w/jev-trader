"use client";

import { useEffect, useReducer, useState } from "react";
import type { BlockEvent, ConnectionState, FeedState, Fill, Meta, Quote, Venue } from "./types";

export { useUptime } from "./useUptime";

/** Max block events kept in memory (oldest -> newest). */
const CAP = 1000;
/** Reconnect backoff, doubling from 1s up to 10s. */
const BACKOFF_MIN = 1000;
const BACKOFF_MAX = 10_000;
/** If nothing arrives for this long (server pings every few seconds), force a reconnect. */
const STALE_MS = 45_000;

interface State extends FeedState {
  /** running accumulators so avgLatencyMs stays O(1) per event */
  latSum: number;
  latCount: number;
}

type Action =
  | { type: "snapshot"; meta: Meta | null; history: BlockEvent[]; fromResponse?: boolean }
  | { type: "meta"; meta: Meta }
  | { type: "block"; event: BlockEvent }
  | { type: "fill"; venue: Venue; revision: number; block: number; fill: Fill }
  | { type: "quote"; venue: Venue; revision: number; block: number; quote: Quote }
  | { type: "connection"; connection: ConnectionState };

const initialState: State = {
  meta: null,
  events: [],
  latest: null,
  connection: "connecting",
  avgLatencyMs: 0,
  latSum: 0,
  latCount: 0,
};

/** latencyMs of a decided (non-late) block, or null if it should not count. */
function latencyOf(e: BlockEvent): number | null {
  const d = e?.decision;
  if (!d || d.late || typeof d.latencyMs !== "number" || !Number.isFinite(d.latencyMs)) return null;
  return d.latencyMs;
}

function indexOfBlock(events: BlockEvent[], block: number): number {
  for (let i = events.length - 1; i >= 0; i--) if (events[i].block === block) return i;
  return -1;
}

function avg(latSum: number, latCount: number): number {
  return latCount > 0 ? Math.round(latSum / latCount) : 0;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "connection":
      return state.connection === action.connection ? state : { ...state, connection: action.connection };

    case "meta":
      if (action.meta.revision !== state.meta?.revision) return state;
      return { ...state, meta: action.meta };

    case "snapshot": {
      if (!action.meta || action.meta.revision < (state.meta?.revision ?? -1)) return state;
      if (action.fromResponse && action.meta.revision === state.meta?.revision) return state;
      const history = Array.isArray(action.history) ? action.history : [];
      // POST and SSE may arrive in either order; stale responses must not overwrite newer session data.
      const last = history[history.length - 1];
      if (action.meta.revision === state.meta?.revision && state.latest && (!last || last.block < state.latest.block)) {
        return state;
      }
      const events = history.length > CAP ? history.slice(history.length - CAP) : history;
      let latSum = 0;
      let latCount = 0;
      for (const e of events) {
        const l = latencyOf(e);
        if (l !== null) {
          latSum += l;
          latCount++;
        }
      }
      return {
        meta: action.meta ?? state.meta,
        events,
        latest: events.length ? events[events.length - 1] : null,
        connection: "live",
        avgLatencyMs: avg(latSum, latCount),
        latSum,
        latCount,
      };
    }

    case "block": {
      const ev = action.event;
      if (!ev || typeof ev.block !== "number" || ev.venue !== state.meta?.venue || ev.revision !== state.meta.revision) return state;
      const prev = state.events;
      const last = prev.length ? prev[prev.length - 1] : null;

      // Dedupe: a re-sent block replaces the one we already have; a stale older block is dropped.
      if (last && ev.block <= last.block) {
        const idx = indexOfBlock(prev, ev.block);
        if (idx < 0) return state;
        const events = prev.slice();
        const old = events[idx];
        events[idx] = ev;
        let latSum = state.latSum;
        let latCount = state.latCount;
        const o = latencyOf(old);
        if (o !== null) {
          latSum -= o;
          latCount--;
        }
        const n = latencyOf(ev);
        if (n !== null) {
          latSum += n;
          latCount++;
        }
        return {
          ...state,
          events,
          latest: events[events.length - 1],
          avgLatencyMs: avg(latSum, latCount),
          latSum,
          latCount,
        };
      }

      let latSum = state.latSum;
      let latCount = state.latCount;
      const n = latencyOf(ev);
      if (n !== null) {
        latSum += n;
        latCount++;
      }
      let events = prev.concat(ev);
      if (events.length > CAP) {
        const drop = events.length - CAP;
        for (let i = 0; i < drop; i++) {
          const l = latencyOf(events[i]);
          if (l !== null) {
            latSum -= l;
            latCount--;
          }
        }
        events = events.slice(drop); // only ever slices once we are over the cap
      }
      return {
        ...state,
        events,
        latest: ev,
        avgLatencyMs: avg(latSum, latCount),
        latSum,
        latCount,
      };
    }

    case "fill": {
      if (action.venue !== state.meta?.venue || action.revision !== state.meta.revision) return state;
      const idx = indexOfBlock(state.events, action.block);
      if (idx < 0) return state;
      const events = state.events.slice();
      const updated: BlockEvent = { ...events[idx], fill: action.fill };
      events[idx] = updated;
      return {
        ...state,
        events,
        latest: idx === events.length - 1 ? updated : state.latest,
      };
    }

    case "quote": {
      if (action.venue !== state.meta?.venue || action.revision !== state.meta.revision) return state;
      const idx = indexOfBlock(state.events, action.block);
      if (idx < 0) return state;
      const events = state.events.slice();
      const updated: BlockEvent = { ...events[idx], quote: action.quote };
      events[idx] = updated;
      return {
        ...state,
        events,
        latest: idx === events.length - 1 ? updated : state.latest,
      };
    }

    default:
      return state;
  }
}

function parseMeta(raw: Record<string, unknown> | null): Meta | null {
  if (!raw || (raw.venue !== "kuru" && raw.venue !== "hyperliquid") || typeof raw.revision !== "number") return null;
  return {
    revision: raw.revision,
    latestBlock: typeof raw.latestBlock === "number" ? raw.latestBlock : undefined,
    venue: raw.venue,
    symbol: typeof raw.symbol === "string" ? raw.symbol : "",
    baseAsset: typeof raw.baseAsset === "string" ? raw.baseAsset : "",
    quoteAsset: typeof raw.quoteAsset === "string" ? raw.quoteAsset : "",
    marketStatus: raw.marketStatus === "live" || raw.marketStatus === "reconnecting" ? raw.marketStatus : "connecting",
    marketUrl: typeof raw.marketUrl === "string" ? raw.marketUrl : "",
    model: typeof raw.model === "string" ? raw.model : "",
    wallet: typeof raw.wallet === "string" ? raw.wallet : null,
    dryRun: Boolean(raw.dryRun),
    market: typeof raw.market === "string" ? raw.market : "",
    chainId: typeof raw.chainId === "number" ? raw.chainId : null,
    marginAccount: typeof raw.marginAccount === "string" ? raw.marginAccount : null,
    startedAt: typeof raw.startedAt === "number" ? raw.startedAt : Date.now(),
  };
}

/** Start the simulated market selected by the route and accept only its SSE snapshots and updates. */
export function useFeed(apiUrl: string, venue: Venue) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") return;
    const base = (apiUrl || "").replace(/\/+$/, "");
    let closed = false;
    let attempt = 0;
    let es: EventSource | null = null;
    let request: AbortController | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let staleTimer: ReturnType<typeof setTimeout> | undefined;

    const armStaleTimer = () => {
      if (staleTimer) clearTimeout(staleTimer);
      staleTimer = setTimeout(() => {
        if (!closed) scheduleReconnect();
      }, STALE_MS);
    };

    const teardown = () => {
      request?.abort();
      request = null;
      if (es) {
        es.onopen = null;
        es.onerror = null;
        es.close();
        es = null;
      }
      if (staleTimer) clearTimeout(staleTimer);
    };

    const scheduleReconnect = () => {
      if (closed) return;
      teardown();
      setLoading(false);
      dispatch({ type: "connection", connection: "reconnecting" });
      const delay = Math.min(BACKOFF_MAX, BACKOFF_MIN * 2 ** attempt);
      attempt++;
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, delay);
    };

    const handle = (source: EventSource, type: string, fn: (data: unknown) => void) => {
      source.addEventListener(type, (raw: Event) => {
        // After navigation or connection replacement, stale requests and queued events must not change the current market.
        if (closed || source !== es) return;
        armStaleTimer();
        const payload = (raw as MessageEvent).data;
        if (typeof payload !== "string" || !payload) return;
        let data: unknown;
        try { data = JSON.parse(payload); } catch { return; }
        fn(data);
      });
    };

    async function connect() {
      if (closed) return;
      setLoading(true);
      dispatch({ type: "connection", connection: attempt === 0 ? "connecting" : "reconnecting" });
      const controller = new AbortController();
      request = controller;
      try {
        const response = await fetch(`${base}/venue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venue }),
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
        });
        const data = await response.json();
        if (closed || request !== controller) return;
        if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "market_unavailable");
        const meta = parseMeta(data);
        if (!meta || meta.venue !== venue) throw new Error("market_unavailable");
        dispatch({ type: "snapshot", meta, history: Array.isArray(data.history) ? data.history : [], fromResponse: true });
        dispatch({ type: "connection", connection: attempt === 0 ? "connecting" : "reconnecting" });
        setError(null);
        request = null;

        // The first SSE snapshot fills the gap between startup and subscription so no records are missed.
        const source = es = new EventSource(`${base}/events?venue=${venue}`);
        armStaleTimer();
        source.onopen = () => {
          if (closed || source !== es) return;
          attempt = 0;
          setLoading(false);
          dispatch({ type: "connection", connection: "live" });
          armStaleTimer();
        };
        source.onerror = () => {
          if (!closed && source === es) scheduleReconnect();
        };

        handle(source, "snapshot", (data) => {
          const d = (data ?? {}) as Record<string, unknown>;
          const meta = parseMeta(d);
          if (!meta || meta.venue !== venue) return;
          const history = Array.isArray(d.history) ? (d.history as BlockEvent[]) : [];
          dispatch({ type: "snapshot", meta, history });
        });
        handle(source, "meta", (data) => {
          const meta = parseMeta((data ?? {}) as Record<string, unknown>);
          if (meta?.venue === venue) dispatch({ type: "meta", meta });
        });
        handle(source, "block", (data) => {
          const event = data as BlockEvent | null;
          if (event?.venue === venue) dispatch({ type: "block", event });
        });
        handle(source, "fill", (data) => {
          const d = (data ?? {}) as { venue: Venue; revision: number; block?: number; fill?: Fill };
          if (d.venue !== venue || typeof d.block !== "number" || !d.fill) return;
          dispatch({ type: "fill", venue: d.venue, revision: d.revision, block: d.block, fill: d.fill });
        });
        handle(source, "quote", (data) => {
          const d = (data ?? {}) as { venue: Venue; revision: number; block?: number; quote?: Quote };
          if (d.venue !== venue || typeof d.block !== "number" || !d.quote) return;
          dispatch({ type: "quote", venue: d.venue, revision: d.revision, block: d.block, quote: d.quote });
        });
        handle(source, "ping", () => dispatch({ type: "connection", connection: "live" }));
      } catch (error) {
        if (closed || controller.signal.aborted) return;
        setError(error instanceof Error ? error.message : "market_unavailable");
        scheduleReconnect();
      } finally {
        if (request === controller) request = null;
      }
    }

    void connect();
    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      teardown();
    };
  }, [apiUrl, venue]);

  return { ...state, loading, error };
}

export default useFeed;
