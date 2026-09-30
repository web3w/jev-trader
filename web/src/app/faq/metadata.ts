import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import { faqIndexCopy, faqIndexPaths } from "./articles";

export const faqIndexUrls = Object.fromEntries(
  Object.entries(faqIndexPaths).map(([locale, path]) => [locale, `https://jev-trader.com${path}`]),
);

export function faqIndexMetadata(locale: Locale): Metadata {
  const title = `${faqIndexCopy[locale].title} | Jev Trader`;
  const description = faqIndexCopy[locale].intro;
  const url = faqIndexUrls[locale];
  return {
    title, description,
    alternates: { canonical: url, languages: { ...faqIndexUrls, "x-default": faqIndexUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }], title, description, url, siteName: "Jev Trader", type: "website", locale: { en: "en_US", "zh-CN": "zh_CN", ko: "ko_KR" }[locale] },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description },
  };
}
