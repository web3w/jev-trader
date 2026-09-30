"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { copy, example, toolPaths } from "./content";
import { buildQuestion, validateAnswer, validateInput, type Evaluation, type QuestionType, type TradingInput } from "./model";
import { createConclusion, decodeConclusion, encodeConclusion, type Conclusion } from "./share";
import styles from "./page.module.css";

type Completed = { input: TradingInput; result: Evaluation };
export default function TradingTool({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [input, setInput] = useState<TradingInput>(() => example(locale, "choice"));
  const [completed, setCompleted] = useState<Completed | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [shared, setShared] = useState<Conclusion | null>(null);
  const [copyState, setCopyState] = useState("");
  const [sharePreview, setSharePreview] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
    const readShare = () => {
      if (!window.location.hash.startsWith("#conclusion=")) { setShared(null); return; }
      try { setShared(decodeConclusion(window.location.hash)); } catch { setError(c.errors.invalid_share); }
    };
    readShare();
    window.addEventListener("hashchange", readShare);
    return () => { requestController.current?.abort(); window.removeEventListener("hashchange", readShare); };
  }, [locale, c.errors.invalid_share]);

  function update(next: TradingInput) {
    setInput(next); setCompleted(null); setError(""); setCopyState(""); setSharePreview(""); setShareUrl("");
  }
  function changeType(type: QuestionType) { update(example(locale, type)); }

  async function run(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(""); setCopyState(""); setSharePreview(""); setShareUrl(""); setCompleted(null);
    let submitted: TradingInput;
    try { submitted = validateInput(input); } catch { setError(c.errors.invalid_input); return; }
    setPending(true);
    const controller = new AbortController();
    requestController.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch("/tools/ask-jev-trading/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(submitted), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(c.errors[data.error as keyof typeof c.errors] ?? c.errors.upstream); return;
      }
      const answer = validateAnswer(data.answer, submitted);
      if (data.source !== "mock" || typeof data.model !== "string") throw new Error("invalid_response");
      setCompleted({ input: submitted, result: { source: "mock", model: data.model, answer } });
      requestAnimationFrame(() => resultHeading.current?.focus());
    } catch { setError(controller.signal.aborted ? c.errors.timeout : c.errors.upstream); }
    finally { window.clearTimeout(timer); setPending(false); }
  }

  async function share(kind: "text" | "link") {
    if (!completed) return;
    const conclusion = createConclusion(completed.input, completed.result, locale);
    const url = `${window.location.origin}${toolPaths[locale]}${encodeConclusion(conclusion)}`;
    const source = conclusion.source === "mock" ? c.mockBadge : c.liveBadge;
    const value = kind === "link" ? url : `Ask Jev Trading\n${source}\n${conclusion.text}\n\n${c.resultNote}\n${c.invitation}\n${url}`;
    setSharePreview(value); setShareUrl(url);
    try { await navigator.clipboard.writeText(value); setCopyState(c.copied); }
    catch { setCopyState(c.copyFailed); }
  }

  const answer = completed?.result.answer;
  const headline = answer?.type === "choice" ? completed!.input.criteria[Number(answer.choice!.replace("option_", ""))]
    : answer?.type === "noul" ? answer.noul === .5 ? c.uncertain : answer.noul! > .5 ? c.yes : c.no : "";
  const bars = answer?.type === "noul" ? [{ label: c.yes, value: answer.noul! }, { label: c.no, value: 1 - answer.noul! }]
    : answer?.probabilities ? completed!.input.criteria.map((label, i) => ({ label: answer.type === "score" ? `${i} · ${label}` : label, value: answer.probabilities![answer.type === "choice" ? `option_${i}` : String(i)] })) : [];

  return <>
    {shared && <section className={styles.shared} aria-label={c.sharedBadge}>
      <span className={styles.badge}>{c.sharedBadge}</span>
      <p className={styles.sharedConclusion}>{shared.text}</p>
      <p>{shared.source === "mock" ? c.mockBadge : c.liveBadge}. {c.sharedNote}</p>
      <p>{c.invitation}</p>
      <a href="#workspace" onClick={() => setShared(null)}>{c.participate}</a>
    </section>}
    <div className={styles.workspace} id="workspace">
      <form className={styles.form} onSubmit={run}>
        <div className={styles.sectionHeading}><h2>{c.workspace}</h2><a href="#how-to-use">{c.guide}</a></div>
        <p className={styles.modeNote}>{c.demoNote}</p>
        <fieldset className={styles.typePicker} disabled={pending}>
          <legend className={styles.srOnly}>{c.exampleTitle}</legend>
          {(["noul", "choice", "score"] as const).map((type) => <label key={type} className={input.type === type ? styles.typeActive : ""}>
            <input type="radio" name="question-type" value={type} checked={input.type === type} onChange={() => changeType(type)} />
            <strong>{c.types[type]}</strong><span>{c.descriptions[type]}</span>
          </label>)}
        </fieldset>
        <fieldset className={styles.fields} disabled={pending}>
          <label htmlFor="trading-question">{c.question}</label>
          <textarea id="trading-question" rows={2} maxLength={500} required value={input.question} onChange={(e) => update({ ...input, question: e.target.value })} />
          <label htmlFor="market-snapshot">{c.context}</label>
          <textarea id="market-snapshot" rows={6} maxLength={6000} required aria-describedby="snapshot-hint" value={input.context} onChange={(e) => update({ ...input, context: e.target.value })} />
          <p className={styles.hint} id="snapshot-hint">{c.contextHint}</p>
          {input.type !== "noul" && <div className={styles.criteria}>
            <h3>{input.type === "choice" ? c.criteria : c.levels}</h3>
            {input.criteria.map((label, i) => <div className={styles.criterion} key={i}>
              <span>{input.type === "score" ? i : String.fromCharCode(65 + i)}</span>
              <input aria-label={`${input.type === "choice" ? c.option : c.level} ${i + 1}`} maxLength={160} required value={label} onChange={(e) => update({ ...input, criteria: input.criteria.map((item, index) => index === i ? e.target.value : item) })} />
              <button type="button" aria-label={`${c.remove} ${i + 1}`} disabled={input.criteria.length <= 2} onClick={() => update({ ...input, criteria: input.criteria.filter((_, index) => index !== i) })}>×</button>
            </div>)}
            <button className={styles.textButton} type="button" disabled={input.criteria.length >= (input.type === "score" ? 10 : 8)} onClick={() => update({ ...input, criteria: [...input.criteria, ""] })}>+ {input.type === "score" ? c.addLevel : c.add}</button>
          </div>}
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={pending}>{pending ? c.running : c.run}</button>
            <button className={styles.textButton} type="button" onClick={() => update({ ...input, question: "", context: "", criteria: input.type === "noul" ? [] : ["", ""] })}>{c.reset}</button>
            <button className={styles.textButton} type="button" onClick={() => update(example(locale, input.type))}>{c.loadExample}</button>
          </div>
        </fieldset>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </form>
      <section className={styles.result} aria-busy={pending}>
        <h2 ref={resultHeading} tabIndex={-1}>{c.result}</h2>
        {!completed ? <div className={styles.empty}>
          <div className={styles.emptyGraphic} aria-hidden="true"><span /><span /><span /></div>
          <h3>{pending ? c.running : c.empty}</h3><p>{c.emptyHint}</p>
        </div> : <>
          <span className={`${styles.badge} ${completed.result.source === "mock" ? styles.mockBadge : ""}`}>{completed.result.source === "mock" ? c.mockBadge : c.liveBadge}</span>
          <p className={styles.conclusion}>{answer?.type === "score" ? <><span className={styles.score}>{answer.score!.toFixed(1)}</span><span className={styles.scoreMax}> / {completed.input.criteria.length - 1}</span></> : headline}</p>
          {answer?.type === "noul" && <p className={styles.resultSub}>{c.yesProbability}: {(answer.noul! * 100).toFixed(1)}%</p>}
          <h3 className={styles.distributionTitle}>{c.distribution}</h3>
          <div className={styles.bars}>{bars.map(({ label, value }, i) => <div key={i} className={styles.barRow}>
            <div><span>{label}</span><strong>{(value * 100).toFixed(1)}%</strong></div>
            <div className={styles.barTrack}><div style={{ width: `${value * 100}%` }} /></div>
          </div>)}</div>
          <section className={styles.explanation}>
            <h3>{c.principle}</h3><p>{c.principles[completed.input.type]}</p>
            {answer?.type === "score" && <p className={styles.formula}>{bars.map(({ value }, i) => `${i} × ${(value * 100).toFixed(1)}%`).join(" + ")} ≈ {answer.score!.toFixed(2)}</p>}
            <a href="https://docs.typesafe.ai/primitives">{c.sources}</a>
          </section>
          <p className={styles.resultNote}>{c.resultNote}</p>
          <details className={styles.fullResult}>
            <summary>{c.full}</summary>
            {answer?.confidence !== undefined && <p>{c.confidence}: {(answer.confidence * 100).toFixed(1)}%</p>}
            {answer?.confidence !== undefined && <p>{c.confidenceNote}</p>}
            <pre tabIndex={0}>{JSON.stringify({ request: { state: completed.input.context, questions: { trading: buildQuestion(completed.input) } }, response: completed.result }, null, 2)}</pre>
          </details>
          <section className={styles.share}>
            <h3>{c.share}</h3><p>{c.shareHint}</p>
            <div className={styles.shareButtons}><button type="button" onClick={() => share("text")}>{c.copyText}</button><button type="button" onClick={() => share("link")}>{c.copyLink}</button></div>
            <p className={styles.hint}>{c.shareDisclosure}</p>
            <p role="status">{copyState}</p>
            {sharePreview && <><textarea aria-label={c.sharePreview} readOnly rows={3} value={sharePreview} onFocus={(e) => e.target.select()} /><a className={styles.previewLink} href={shareUrl}>{c.sharePreview}</a></>}
          </section>
        </>}
      </section>
    </div>
  </>;
}
