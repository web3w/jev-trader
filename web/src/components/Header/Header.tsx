"use client";

import Link from "next/link";
import { marketPaths } from "@/lib/markets";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockEvent, ConnectionState, Meta, Venue } from "@/lib/types";
import { fmtInt, shortAddr } from "@/lib/format";
import { isLocale, languages, type Locale, type Messages } from "@/lib/i18n";
import styles from "./Header.module.css";

export interface HeaderProps {
  meta: Meta | null;
  latest: BlockEvent | null;
  connection: ConnectionState;
  messages: Messages;
  locale: Locale;
  onLanguageChange: (locale: Locale) => void;
  activeVenue: Venue;
  loading: boolean;
  error: string | null;
}

export default function Header({ meta, latest, connection, messages, locale, onLanguageChange, activeVenue, loading, error }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const wallet = meta?.wallet ?? null;

  const onCopy = useCallback(() => {
    if (!wallet) return;
    try {
      void navigator.clipboard?.writeText(wallet)?.catch(() => {});
    } catch {
      /* clipboard unavailable, still flash "copied" so the click feels alive */
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1200);
  }, [wallet]);

  // Show only the existing simulation status for local mocks, without exposing internal model identifiers.
  const model = meta?.model === "mock" ? null : meta?.model ?? null;
  const isJev = (model ?? "").toLowerCase().startsWith("jev");
  const marketConnection = connection === "live" ? meta?.marketStatus ?? "connecting" : connection;
  const offline = marketConnection === "live" ? null : messages[marketConnection];
  // Trust only current connection metadata for the chain head; never present old records as live height after a disconnect.
  const displayedBlock = meta?.venue === "hyperliquid"
    ? connection === "live" ? meta.latestBlock : undefined
    : latest?.block;
  const errorText = error === "live_switch_disabled" ? messages.liveSwitchDisabled : messages.switchUnavailable;

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <h1 className={styles.brand}>‖ Jev Trader</h1>

        <span className={styles.block}>{messages.block} {displayedBlock == null ? "-" : fmtInt(displayedBlock)}</span>

        <span className={styles.spacer} />

        {offline ? <span className={styles.offline}>{offline}</span> : null}

        <button
          type="button"
          className={styles.wallet}
          onClick={onCopy}
          disabled={!wallet}
          title={wallet ?? messages.noWallet}
          aria-label={wallet ? `${messages.copyWallet} ${wallet}` : messages.dryRun}
        >
          {copied ? messages.copied : wallet ? shortAddr(wallet) : messages.dryRun}
        </button>

        {model ? (
          <span
            className={styles.badge}
            style={{
              background: isJev
                ? "var(--badge-jev-bg)"
                : "var(--badge-standin-bg)",
              color: isJev ? "var(--badge-jev-fg)" : "var(--badge-standin-fg)",
            }}
          >
            {model}
          </span>
        ) : null}

        <select
          className={styles.language}
          aria-label={messages.language}
          value={locale}
          onChange={(event) => {
            const next = event.target.value;
            if (isLocale(next)) onLanguageChange(next);
          }}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code} lang={language.code}>
              {language.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.marketRow}>
        <nav className={styles.venues} aria-label={messages.tradingVenue}>
          {(["hyperliquid", "kuru"] as const).map((venue) => (
            <Link
              key={venue}
              href={marketPaths[venue]}
              className={styles.venue}
              aria-current={activeVenue === venue ? "page" : undefined}
            >
              <span>{venue === "kuru" ? "Kuru" : "Hyperliquid"}</span>
              <small>{venue === "kuru" ? "MON/USDC" : "HYPE/USDC"}</small>
            </Link>
          ))}
        </nav>
        <div className={styles.marketSummary} aria-live="polite">
          <div className={styles.marketStatusRow}>
            <span className={styles.marketStatus}>{loading ? messages.connecting : offline ?? messages.liveMarket}</span>
            <Link
              href="/faq/jev-ai-decision-model"
              className={styles.guideLink}
              target="_blank"
              rel="noopener noreferrer"
              title={messages.opensInNewTab}
              aria-label={`${messages.jevGuide} (${messages.opensInNewTab})`}
            >
              {messages.jevGuide} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <span className={styles.marketHint}>{meta?.dryRun ? `${messages.paperTrading} / ${messages.switchHint}` : meta ? messages.liveSwitchDisabled : ""}</span>
        </div>
      </div>
      {error ? <p className={styles.error} role="alert">{errorText}</p> : null}
    </header>
  );
}
