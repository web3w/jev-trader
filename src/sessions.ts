import type { TradingSession, Venue } from "./session";

export class Sessions {
  private revision = Date.now();
  private running = new Set<Venue>();
  private starting = new Map<Venue, Promise<ReturnType<Sessions["snapshot"]>>>();

  constructor(private readonly sessions: Record<Venue, TradingSession>) {
    // Each market has its own lifecycle revision; refreshes and repeated starts preserve history and revision.
    for (const session of Object.values(sessions)) session.meta.revision = ++this.revision;
  }

  get(venue: string = "hyperliquid") {
    if (venue !== "kuru" && venue !== "hyperliquid") throw Error("invalid_venue");
    return this.sessions[venue];
  }

  snapshot(venue: string = "hyperliquid") {
    const session = this.get(venue);
    // Bound network snapshots while retaining the full in-memory trading history.
    return { ...session.meta, history: session.history.slice(-100) };
  }

  async ensureStarted(venue: string) {
    const session = this.get(venue);
    const key = session.meta.venue;
    // Page navigation can only start simulations, never implicitly activate the configured live wallet.
    if (!session.meta.dryRun) throw Error("live_switch_disabled");
    if (this.running.has(key)) return this.snapshot(key);
    const existing = this.starting.get(key);
    if (existing) return existing;
    session.meta.marketStatus = "connecting";
    // Register the promise before starting to coalesce concurrent requests from tabs for the same market.
    const pending = Promise.resolve().then(async () => {
      try {
        await session.start();
        this.running.add(key);
        return this.snapshot(key);
      } catch (error) {
        console.error(`${key} start:`, error instanceof Error ? error.message : "failed");
        try { await session.stop(); } catch (cleanupError) { console.error(`${key} stop:`, cleanupError); }
        session.meta.marketStatus = "reconnecting";
        throw Error("market_unavailable");
      } finally { this.starting.delete(key); }
    });
    this.starting.set(key, pending);
    return pending;
  }
}
