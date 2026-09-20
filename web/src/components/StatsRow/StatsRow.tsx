"use client";

import { useEffect, useState } from "react";
import type { BlockEvent, Meta } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { fmtInt, uptime } from "@/lib/format";
import styles from "./StatsRow.module.css";

const DASH = "-";

export default function StatsRow({
  latest,
  avgLatencyMs,
  meta,
  messages,
}: {
  latest: BlockEvent | null;
  avgLatencyMs: number;
  meta: Meta | null;
  messages: Messages;
}) {
  const startedAt = meta?.startedAt ?? null;
  // Ticks once a second; starts on the client so SSR and hydration agree.
  const [up, setUp] = useState<string | null>(null);

  useEffect(() => {
    if (startedAt == null) {
      setUp(null);
      return;
    }
    const tick = () => setUp(uptime(startedAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const decision = latest?.decision ?? null;
  const last = decision && !decision.late ? `${decision.latencyMs} ms` : `${DASH} ms`;
  const avg =
    Number.isFinite(avgLatencyMs) && avgLatencyMs > 0 ? `${Math.round(avgLatencyMs)}ms` : DASH;
  const totals = latest?.totals ?? null;

  return (
    <div className={styles.stats}>
      <span>{messages.last} {last}</span>
      <span>{messages.avg} {avg}</span>
      <span className={styles.nowrap}>{totals ? fmtInt(totals.decisions) : DASH} {messages.calls}</span>
      <span className={styles.nowrap}>{totals ? fmtInt(totals.fills) : DASH} {messages.fills}</span>
      <span className={styles.spacer} />
      <span>{messages.uptime} {up ?? "00:00:00"}</span>
    </div>
  );
}
