import type { MetadataRoute } from "next";
import { scoreFaqUrls } from "./faq/jev-score/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  // Include the home page, market pages and model guide URLs.
  return [
    { url: "https://jev-trader.com/" },
    { url: "https://jev-trader.com/hyperliquid-hype-usdc" },
    { url: "https://jev-trader.com/kuru-mon-usdc" },
    { url: "https://jev-trader.com/jev-ai-decision-model" },
    ...Object.values(scoreFaqUrls).map((url) => ({ url, alternates: { languages: { ...scoreFaqUrls, "x-default": scoreFaqUrls.en } } })),
  ];
}
