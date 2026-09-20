import type { Venue } from "./types";

// Expose only the two integrated markets; routes must not map arbitrary pairs to existing feeds.
export const marketPaths: Record<Venue, string> = {
  hyperliquid: "/",
  kuru: "/kuru-mon-usdc",
};
