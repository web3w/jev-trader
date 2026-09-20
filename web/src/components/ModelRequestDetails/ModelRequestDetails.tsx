import { useMemo } from "react";
import type { BlockEvent, Meta } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { fmtInt } from "@/lib/format";
import styles from "./ModelRequestDetails.module.css";

// Both entry points share request content; each entry point still manages popover placement and visibility.
export default function ModelRequestDetails({ event, meta, messages, onClose, titleId }: {
  event: BlockEvent;
  meta: Meta | null;
  messages: Messages;
  onClose: () => void;
  titleId: string;
}) {
  const isHyperliquid = meta?.venue === "hyperliquid";
  const input = useMemo(() => JSON.stringify(event.modelTrace?.input, null, 2), [event.modelTrace?.input]);
  const output = useMemo(() => JSON.stringify(event.modelTrace?.output, null, 2), [event.modelTrace?.output]);

  return (
    <>
      <div className={styles.requestHeader}>
        <div>
          <h3 id={titleId}>{messages.requestTitle}</h3>
          <p>{meta?.symbol} · {messages.block} {isHyperliquid ? event.chainBlock == null ? "-" : fmtInt(event.chainBlock) : fmtInt(event.block)}</p>
        </div>
        <button type="button" className={styles.closeRequest} aria-label={messages.closeRequest} onClick={onClose}>×</button>
      </div>
      {event.modelTrace ? <>
        <div className={styles.requestSource}>
          {event.modelTrace.source === "simulation" ? messages.requestSimulation : `Jev · ${event.modelTrace.model}`}
          {event.decision && <span>{messages.requestExecution}: {messages[event.decision.action]}</span>}
        </div>
        <div className={styles.requestColumns}>
          <section><h4>INPUT</h4><pre tabIndex={0} aria-label="INPUT">{input}</pre></section>
          <section><h4>OUTPUT</h4><pre tabIndex={0} aria-label="OUTPUT">{output}</pre></section>
        </div>
        <p className={styles.requestNote}>{messages.requestOutputNote}</p>
      </> : <p className={styles.noRequest}>{!event.decision || event.decision.late ? messages.requestNotCalled : messages.requestUnavailable}</p>}
    </>
  );
}
