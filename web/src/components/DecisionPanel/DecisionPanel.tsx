"use client";

import type { BlockEvent, Meta } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { fmtPct } from "@/lib/format";
import styles from "./DecisionPanel.module.css";

export interface DecisionPanelProps {
  latest: BlockEvent | null;
  meta: Meta | null;
  messages: Messages;
}

type Chosen = "buy" | "sell" | null;

interface BarRowProps {
  label: string;
  /** css color for the label text */
  labelColor: string;
  /** dims the label to .38 when false */
  active: boolean;
  /** 0..1, fill width as a fraction of the track */
  value: number;
  /** css background for the fill */
  fill: string;
  /** right-hand percentage text ("62%" or "-") */
  pct: string;
}

function BarRow({ label, labelColor, active, value, fill, pct }: BarRowProps) {
  return (
    <div className={styles.row}>
      <span
        className={styles.label}
        style={{ color: labelColor, opacity: active ? 1 : 0.38 }}
      >
        {label}
      </span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: `${Math.max(0, Math.min(1, value)) * 100}%`,
            background: fill,
          }}
        />
      </div>
      <span className={styles.pct}>{pct}</span>
    </div>
  );
}

export default function DecisionPanel({ latest, meta, messages }: DecisionPanelProps) {
  const decision = latest?.decision ?? null;
  const late = decision ? decision.late : true;
  // "hold" is treated as a non-decision, exactly as the feed does.
  const chosen: Chosen =
    decision && !decision.late && decision.action !== "hold"
      ? decision.action
      : null;

  const probs = decision?.probabilities ?? { buy: 0, sell: 0, hold: 0 };
  const decided = decision !== null && !late && chosen !== null;
  const pctOf = (p: number) => (decided ? fmtPct(p) : "-");

  const headline = messages[chosen ?? (!decision && meta?.venue === "hyperliquid" ? "noDecision" : decision && !late ? "hold" : "late")].toUpperCase();
  const headlineColor = chosen
    ? chosen === "buy"
      ? "var(--buy-ink)"
      : "var(--sell-ink)"
    : !decision && meta?.venue === "hyperliquid" ? "var(--muted)" : "var(--late-ink)";
  const headlinePct = chosen ? fmtPct(probs[chosen]) : "";

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <div className={styles.sectionLabel}>{messages.standingOrder}</div>
        <div className={styles.order}>
          {meta?.venue === "hyperliquid" ? messages.spotInstruction : messages.orderInstruction}
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.sectionLabel} ${styles.sectionLabelGap}`}>
          {meta?.venue === "hyperliquid" ? messages.decisionDirection : messages.whichSide}
        </div>

        <div className={styles.headline} style={{ color: headlineColor }}>
          <span className={styles.headlineWord}>{headline}</span>
          {headlinePct ? (
            <span className={styles.headlinePct}>{headlinePct}</span>
          ) : null}
        </div>

        <BarRow
          label={messages.buy}
          labelColor="var(--buy-ink)"
          active={chosen === "buy"}
          value={probs.buy}
          fill={chosen === "buy" ? "var(--buy-bar)" : "var(--buy-bar-dim)"}
          pct={pctOf(probs.buy)}
        />
        <BarRow
          label={messages.sell}
          labelColor="var(--sell-ink)"
          active={chosen === "sell"}
          value={probs.sell}
          fill={chosen === "sell" ? "var(--sell-bar)" : "var(--sell-bar-dim)"}
          pct={pctOf(probs.sell)}
        />
      </section>
    </div>
  );
}
