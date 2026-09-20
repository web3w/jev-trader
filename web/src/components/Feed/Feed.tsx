"use client";

import { useEffect, useRef, useState } from "react";
import type { BlockEvent, Meta } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { fmtInt, fmtPrice, shortTx, txUrl } from "@/lib/format";
import styles from "./Feed.module.css";

/** Must match `.row { height }` in Feed.module.css. */
const ROW_H = 26;
/** Hard ceiling, so a very tall viewport does not render an absurd list. */
const MAX_ROWS = 40;

type Kind = "buy" | "sell" | "late" | "waiting";

function kindOf(event: BlockEvent, isHyperliquid: boolean): Kind {
  // Fill updates are independent of model decisions; a fill without a new decision is not a missed market update.
  if (isHyperliquid && event.fill) return event.fill.side;
  if (isHyperliquid && !event.decision) return "waiting";
  const d = event.decision;
  if (!d || d.late) return "late";
  if (d.action === "buy") return "buy";
  if (d.action === "sell") return "sell";
  return "late";
}

function fmtSize(size: number, decimals: number): string {
  return size.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

const KIND_CLASS: Record<Kind, string> = {
  buy: styles.kindBuy,
  sell: styles.kindSell,
  late: styles.kindLate,
  waiting: styles.kindLate,
};

/**
 * One row per block. The word is the side the model picked, the detail is the order that went on
 * the book (bid or ask at its price), and when a taker hit one of our orders in that block the
 * detail becomes the fill instead. The tx column is the order's transaction: dim while pending,
 * "rev" if the book moved through the price before it landed.
 */
export default function Feed({ events, meta, messages }: { events: BlockEvent[]; meta: Meta | null; messages: Messages }) {
  const isHyperliquid = meta?.venue === "hyperliquid";
  const priceDecimals = isHyperliquid ? 3 : 6;
  const sizeDecimals = isHyperliquid ? 5 : 2;
  const listRef = useRef<HTMLDivElement | null>(null);
  // How many whole 26px rows fit in the box the layout gives us. The list
  // itself clips, so a wrong guess is never a half-drawn row, only a hidden one.
  const [capacity, setCapacity] = useState(MAX_ROWS);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const measure = () => {
      const fits = Math.max(1, Math.min(MAX_ROWS, Math.floor(el.clientHeight / ROW_H)));
      setCapacity((prev) => (prev === fits ? prev : fits));
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rows = events.slice(-capacity).reverse();

  return (
    <section className={styles.feed}>
      <div className={styles.label}>{messages.feed}{isHyperliquid ? ` / ${messages.observedBlock}` : ""}</div>
      <div className={styles.list} ref={listRef}>
        {rows.length === 0 ? (
          <div className={styles.empty}>{isHyperliquid ? messages.noMarketUpdates : messages.noBlocks}</div>
        ) : (
          rows.map((event, i) => {
            const kind = kindOf(event, isHyperliquid);
            const decision = event.decision;
            const quote = event.quote;
            const fill = event.fill;
            const decided = kind === "buy" || kind === "sell";
            const kindClass = KIND_CLASS[kind];

            const conf =
              !decided || !decision
                ? ""
                : `${messages.confidence} ` +
                  Math.max(
                    decision.probabilities.buy,
                    decision.probabilities.sell,
                    decision.probabilities.hold,
                  ).toFixed(2);

            const lat = !decided || !decision ? "" : `${decision.latencyMs}ms`;

            let detail = "";
            let detailMuted = false;
            if (fill && fill.size > 0) {
              detail = `${messages.fill.toUpperCase()} ${fmtSize(fill.size, sizeDecimals)} @ ${fmtPrice(fill.price, priceDecimals)}`;
            } else if (decided && quote) {
              const word = quote.side === "buy" ? messages.bid : messages.ask;
              detail = `${word} ${fmtSize(quote.size, sizeDecimals)} @ ${fmtPrice(quote.price, priceDecimals)}${quote.capped ? ` ${messages.cap}` : ""}`;
              detailMuted = quote.status === "reverted" || quote.status === "lost";
            } else if (decided) {
              detail = messages.noQuote;
              detailMuted = true;
            }

            const rowClass = [styles.row, isHyperliquid ? styles.chainRow : "", kindClass, i === 0 ? styles.newest : "", fill ? styles.filled : ""]
              .filter(Boolean)
              .join(" ");

            return (
              <div key={event.block} className={rowClass}>
                <span
                  className={`${styles.cell} ${styles.block}${isHyperliquid ? ` ${styles.chainBlock}` : ""}`}
                  title={isHyperliquid ? messages.observedBlockHint : undefined}
                >
                  {isHyperliquid ? event.chainBlock == null ? "-" : fmtInt(event.chainBlock) : fmtInt(event.block)}
                </span>
                <span className={`${styles.cell} ${styles.word}`}>{(decision?.action === "hold" && !decision.late ? messages.hold : messages[kind]).toUpperCase()}</span>
                <span className={`${styles.cell} ${styles.conf}`}>{conf}</span>
                <span className={`${styles.cell} ${styles.lat}`}>{lat}</span>
                <span
                  className={`${styles.cell} ${styles.detail}${detailMuted ? ` ${styles.muted}` : ""}`}
                >
                  {detail}
                </span>
                <span className={`${styles.cell} ${styles.tx}`}>
                  {fill && !fill.simulated && fill.txHash ? (
                    <a href={txUrl(fill.txHash)} target="_blank" rel="noreferrer" title={messages.takerTransaction}>
                      {shortTx(fill.txHash)}
                    </a>
                  ) : fill?.simulated || quote?.status === "sim" ? (
                    <span className={styles.muted}>{messages.sim}</span>
                  ) : quote && quote.txHash ? (
                    <a
                      className={quote.status === "sent" ? styles.pending : quote.status === "placed" ? undefined : styles.muted}
                      title={messages[quote.status]}
                      href={txUrl(quote.txHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {quote.status === "reverted" ? messages.reverted : quote.status === "lost" ? messages.lost : shortTx(quote.txHash)}
                    </a>
                  ) : null}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
