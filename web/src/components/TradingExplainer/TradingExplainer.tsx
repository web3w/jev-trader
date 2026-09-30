"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import ModelRequestDetails from "@/components/ModelRequestDetails/ModelRequestDetails";
import type { Messages } from "@/lib/i18n";
import type { BlockEvent, Meta, Venue } from "@/lib/types";
import styles from "./TradingExplainer.module.css";

export default function TradingExplainer({ venue, meta, messages, requestEvent }: { venue: Venue; meta: Meta | null; messages: Messages; requestEvent: BlockEvent | null }) {
  const [playing, setPlaying] = useState(true);
  const [requestCase, setRequestCase] = useState<{ event: BlockEvent; meta: Meta | null } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogId = useId();
  const caseTitleId = useId();
  useEffect(() => {
    if (requestCase) dialogRef.current?.showModal();
  }, [requestCase]);
  // Market descriptions remain readable before the live feed connects.
  const isHyperliquid = venue === "hyperliquid";
  const modelDescription = !meta?.model ? messages.howConnecting : meta.model === "mock" ? messages.howMock : messages.howJev;
  const market = isHyperliquid ? "HYPE/USDC / Hyperliquid" : "MON/USDC / Kuru";
  // This animation explains the flow only; it neither subscribes to fills nor claims to show live orders.
  const steps = [
    { title: messages.howMarketStep, body: messages.howMarketBody },
    { title: messages.howDecisionStep, body: messages.howDecisionBody },
    { title: messages.howOrderStep, body: messages.howOrderBody },
    { title: messages.howFillStep, body: !meta ? messages.howConnecting : meta.dryRun ? messages.howFillSimBody : messages.howFillLiveBody },
  ];
  const inputs = [
    { label: messages.howMarketLabel, value: market },
    { label: messages.howPriceLabel, value: messages.howPriceBody },
    { label: messages.howBookLabel, value: messages.howBookBody },
    { label: messages.howTrendLabel, value: messages.howTrendBody },
    { label: messages.howTradesLabel, value: isHyperliquid ? messages.howTradesHyper : messages.howTradesKuru },
    { label: messages.howAllowedLabel, value: messages.howAllowedBody },
  ];

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{messages.howEyebrow}</p>
          <h2 id={titleId}>{messages.howTitle}</h2>
          <p className={styles.intro}>{messages.howIntro}</p>
        </div>
        <div className={styles.model}>
          <span className={styles.modelBadge}>{meta?.model === "mock" ? messages.dryRun : meta?.model || messages.howConnecting}</span>
          <p>{modelDescription}</p>
        </div>
      </header>

      <figure className={styles.diagram} data-paused={!playing}>
        <figcaption className={styles.diagramHeader}>
          <span>{messages.howDiagram}</span>
          <button className={styles.motionControl} type="button" onClick={() => setPlaying(!playing)}>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              {playing ? <path d="M4 3v10M11 3v10" /> : <path d="m5 3 7 5-7 5Z" />}
            </svg>
            {playing ? messages.howPause : messages.howPlay}
          </button>
        </figcaption>
        <ol className={styles.flow}>
          {steps.map((step, index) => (
            <li className={styles.step} key={index}>
              <div className={styles.stepNumber} aria-hidden="true">0{index + 1}</div>
              <div className={styles.stepCopy}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              {index < steps.length - 1 ? (
                <span className={styles.connector} aria-hidden="true">
                  <span className={styles.particle} style={{ animationDelay: `${index * -1.6}s` }} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </figure>

      <div className={styles.details}>
        <section className={styles.inputs}>
          <div className={styles.inputHeading}>
            <h3 className={styles.sectionTitle}>{messages.howInputsTitle}</h3>
            <button className={styles.caseButton} type="button" disabled={!requestEvent}
              aria-haspopup="dialog" aria-expanded={requestCase !== null} aria-controls={dialogId}
              title={requestEvent ? messages.howRequestCase : messages.requestUnavailable}
              onClick={() => {
                // Freeze the latest decision with inputs and outputs when clicked so feed updates do not change it while reading.
                if (requestEvent) setRequestCase({ event: requestEvent, meta });
              }}>
              {messages.howRequestCase}
            </button>
          </div>
          <dl className={styles.inputList}>
            {inputs.map((input) => (
              <div className={styles.input} key={input.label}>
                <dt>{input.label}</dt>
                <dd>{input.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className={styles.explanation}>
          <section className={styles.instruction}>
            <h3 className={styles.sectionTitle}>{messages.howInstructionTitle}</h3>
            <p>{messages.howInstructionBody}</p>
            <p className={styles.timing}>{isHyperliquid ? messages.howTimingHyper : messages.howTimingKuru}</p>
          </section>
          <section className={styles.boundary}>
            <h3 className={styles.sectionTitle}>{messages.howBoundaryTitle}</h3>
            <ul>
              <li>{messages.howIndependent}</li>
              <li>{messages.howMissingAccount}</li>
              <li>{isHyperliquid ? messages.howBlockHyper : messages.howBlockKuru}</li>
            </ul>
          </section>
        </div>
      </div>
      <div className={styles.guideFooter}>
        <Link
          href="/faq/jev-ai-decision-model"
          className={styles.guideLink}
          target="_blank"
          rel="noopener noreferrer"
          title={messages.opensInNewTab}
          aria-label={`${messages.jevLearnMore} (${messages.opensInNewTab})`}
        >
          {messages.jevLearnMore} <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <dialog ref={dialogRef} id={dialogId} className={styles.caseDialog} aria-labelledby={caseTitleId}
        onClose={() => setRequestCase(null)}
        onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        {requestCase && <ModelRequestDetails event={requestCase.event} meta={requestCase.meta} messages={messages}
          titleId={caseTitleId} onClose={() => dialogRef.current?.close()} />}
      </dialog>
    </section>
  );
}
