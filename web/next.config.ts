import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The repo root also has a bun.lock; pin the workspace root to this app.
  turbopack: { root: path.resolve(__dirname) },
  // Preserve redirects for legacy links and use clear lowercase, hyphenated URLs for pages and navigation.
  redirects() {
    return [
      { source: "/hyperliquid/HYPE/USDC", destination: "/hyperliquid-hype-usdc", permanent: true },
      { source: "/kuru/MON/USDC", destination: "/kuru-mon-usdc", permanent: true },
      { source: "/jev", destination: "/faq/jev-ai-decision-model", permanent: true },
      { source: "/jev-ai-decision-model", destination: "/faq/jev-ai-decision-model", permanent: true },
    ];
  },
};

export default nextConfig;
