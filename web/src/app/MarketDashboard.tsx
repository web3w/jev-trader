"use client";

import DecisionPanel from "@/components/DecisionPanel/DecisionPanel";
import Feed from "@/components/Feed/Feed";
import FlowChart from "@/components/FlowChart/FlowChart";
import Header from "@/components/Header/Header";
import NetworkFooter from "@/components/NetworkFooter/NetworkFooter";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import StatsRow from "@/components/StatsRow/StatsRow";
import TradingExplainer from "@/components/TradingExplainer/TradingExplainer";
import { useFeed } from "@/lib/useFeed";
import { useLanguage } from "@/lib/useLanguage";
import type { Venue } from "@/lib/types";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://jev-trader-production.up.railway.app";

export default function MarketDashboard({ venue }: { venue: Venue }) {
  const feed = useFeed(API_URL, venue);
  const { locale, messages, changeLanguage } = useLanguage();
  const requestEvent = feed.events.findLast((event) => event.modelTrace) ?? null;

  return (
    <>
      <div className="card">
        <Header meta={feed.meta} latest={feed.latest} connection={feed.connection} messages={messages} locale={locale} onLanguageChange={changeLanguage} activeVenue={venue} loading={feed.loading} error={feed.error} />
        <div id="trading-dashboard" className={styles.dashboard}>
          <StatsRow latest={feed.latest} avgLatencyMs={feed.avgLatencyMs} meta={feed.meta} messages={messages} />
          <div className={styles.main}>
            <div className={styles.left}>
              <div className={styles.chartWrap}>
                <FlowChart key={`${feed.meta?.venue}-${feed.meta?.revision}`} meta={feed.meta} events={feed.events} latest={feed.latest} messages={messages} />
              </div>
            </div>
            <div className={styles.right}>
              <DecisionPanel venue={venue} latest={feed.latest} messages={messages} />
              <Feed key={`${feed.meta?.venue}-${feed.meta?.revision}`} meta={feed.meta} events={feed.events} messages={messages} />
            </div>
          </div>
        </div>
        <NetworkFooter venue={venue} meta={feed.meta} messages={messages} connection={feed.connection} />
      </div>
      <TradingExplainer key={`${feed.meta?.venue}-${feed.meta?.revision}`} venue={venue} meta={feed.meta} messages={messages} requestEvent={requestEvent} />
      <SiteFooter locale={locale} />
    </>
  );
}
