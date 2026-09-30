import type { MetadataRoute } from "next";
import { faqIndexUrls } from "./faq/metadata";
import { toolUrls } from "./tools/ask-jev-trading/content";
import { toolUrls as polymarketUrls } from "./tools/polymarket/content";
import { faqArticles } from "./faq/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  // Include the home page, market pages and model guide URLs.
  return [
    { url: "https://jev-trader.com/" },
    { url: "https://jev-trader.com/about" },
    ...Object.values(toolUrls).map((url) => ({ url, alternates: { languages: { ...toolUrls, "x-default": toolUrls.en } } })),
    ...Object.values(polymarketUrls).map((url) => ({ url, alternates: { languages: { ...polymarketUrls, "x-default": polymarketUrls.en } } })),
    { url: "https://jev-trader.com/kuru-mon-usdc" },
    ...Object.values(faqIndexUrls).map((url) => ({ url, alternates: { languages: { ...faqIndexUrls, "x-default": faqIndexUrls.en } } })),
    // The article catalog is also the source for sitemap entries; shared legacy URLs appear once.
    ...faqArticles.flatMap((article) => {
      const urls = Object.fromEntries(Object.entries(article.paths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]));
      const uniqueUrls = [...new Set(Object.values(urls))];
      return uniqueUrls.map((url) => ({ url, ...(uniqueUrls.length > 1 || Object.keys(urls).length === 1 ? { alternates: { languages: { ...urls, "x-default": urls.en ?? uniqueUrls[0] } } } : {}) }));
    }),
  ];
}
