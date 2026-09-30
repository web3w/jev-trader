import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";
import ScoreFaq from "./ScoreFaq";
import { scoreFaqContent } from "./content";
import { scoreFaqUrls } from "./routes";

export function scoreFaqMetadata(locale: Locale): Metadata {
  const copy = scoreFaqContent[locale];
  const title = `${copy.title} | Jev Trader`;
  const canonical = scoreFaqUrls[locale];
  return {
    title,
    description: copy.intro,
    alternates: { canonical, languages: { ...scoreFaqUrls, "x-default": scoreFaqUrls.en } },
    openGraph: { images: [{ url: "https://jev-trader.com/og.png", width: 800, height: 419, alt: "Jev Trader — From market data to a trading decision" }],
      title, description: copy.intro, url: canonical, siteName: "Jev Trader", type: "article",
      locale: { en: "en_US", "zh-CN": "zh_CN", ko: "ko_KR" }[locale],
    },
    twitter: { card: "summary_large_image", images: ["https://jev-trader.com/og.png"], title, description: copy.intro },
  };
}

export function ScoreFaqPage({ locale }: { locale: Locale }) {
  const copy = scoreFaqContent[locale];
  // Derive structured data from actual content without inventing authors, publication dates or promises of Google features.
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.intro,
    inLanguage: locale,
    url: scoreFaqUrls[locale],
    mainEntityOfPage: scoreFaqUrls[locale],
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Jev Trader", url: "https://jev-trader.com" },
    citation: ["https://docs.typesafe.ai/api", "https://docs.typesafe.ai/primitives/score", "https://docs.typesafe.ai/confidence"],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article).replace(/</g, "\\u003c") }} />
    <ScoreFaq locale={locale} />
  </>;
}
