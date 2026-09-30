"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { cases, copy, kinds, referenceUrl } from "./content";
import { compare, makeRequest, type Kind, type Row } from "./model";
import styles from "./page.module.css";

export default function MarketTool({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [kind, setKind] = useState<Kind>("noul");
  const [question, setQuestion] = useState(cases.noul.text[locale].question);
  const [rules, setRules] = useState(cases.noul.text[locale].rules);
  const [evidence, setEvidence] = useState("");
  const [rows, setRows] = useState<Row[]>(() => initialRows("noul"));
  const [cost, setCost] = useState("0");
  const [result, setResult] = useState<ReturnType<typeof compare> | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const selected = cases[kind];
  const request = makeRequest(kind, { question, rules, evidence, url: selected.url, criteria: rows.map((row) => row.label) });

  useEffect(() => {
    // The URL selects the language; storage only remembers it for later visits to the dashboard.
    document.documentElement.lang = locale;
    try { localStorage.setItem("jev-trader-language", locale); } catch { /* The tool works without storage. */ }
  }, [locale]);

  function initialRows(type: Kind): Row[] {
    return cases[type].text[locale].outcomes.map((label, i) => ({ label, probability: "", yes: cases[type].quotes[i][0], no: cases[type].quotes[i][1] }));
  }

  function reset(type: Kind) {
    setKind(type); setQuestion(cases[type].text[locale].question); setRules(cases[type].text[locale].rules);
    setEvidence(""); setRows(initialRows(type)); setCost("0"); setResult(null); setCopyStatus("");
  }

  function updateRow(index: number, field: keyof Row, value: string) {
    setRows((current) => current.map((row, i) => i === index ? { ...row, [field]: value } : row));
    setResult(null); setCopyStatus("");
  }

  async function copyRequest() {
    if (!request) return;
    try { await navigator.clipboard.writeText(JSON.stringify(request, null, 2)); setCopyStatus(c.copied); }
    catch { setCopyStatus(c.copyFailed); }
  }

  const number = (value: number | null) => value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(2)}`;

  return <>
    <fieldset className={styles.picker}>
      <legend>{c.choose}</legend>
      {/* Buttons avoid native radio restoration selecting a case independently of React after browser back. */}
      <div>{kinds.map((type, i) => <button key={type} type="button" aria-pressed={kind === type} onClick={() => reset(type)} className={kind === type ? styles.active : undefined}>
        <span className={styles.type}>{String(i + 1).padStart(2, "0")} / {type.toUpperCase()}</span>
        <strong>{c.names[type]}</strong><span>{cases[type].text[locale].title}</span>
      </button>)}</div>
    </fieldset>

    <div className={styles.workspace}>
      <section className={styles.editor} aria-labelledby="question-heading">
        <h2 id="question-heading">{c.edit}</h2>
        <div className={styles.source}>
          <a href={selected.url} target="_blank" rel="noopener noreferrer">{c.market}</a>
          <p>{c.snapshot}: <time dateTime={selected.checked}>{selected.checked.replace("T", " ").replace("Z", " UTC")}</time></p>
          <p>{c.snapshotNote}</p>
        </div>
        <label htmlFor="market-question">{c.question}</label>
        <textarea id="market-question" rows={3} maxLength={2000} value={question} onChange={(event) => { setQuestion(event.target.value); setCopyStatus(""); setResult(null); }} />
        <label htmlFor="market-rules">{c.rules}</label>
        <textarea id="market-rules" rows={6} maxLength={15000} value={rules} onChange={(event) => { setRules(event.target.value); setCopyStatus(""); setResult(null); }} />
        <label htmlFor="market-evidence">{c.evidence}</label>
        <textarea id="market-evidence" rows={5} maxLength={15000} value={evidence} placeholder={c.evidencePlaceholder} aria-describedby="evidence-hint" onChange={(event) => { setEvidence(event.target.value); setCopyStatus(""); setResult(null); }} />
        <p id="evidence-hint" className={styles.hint}>{c.evidenceHint}</p>
        <button className={styles.secondary} onClick={() => reset(kind)}>{c.reset}</button>
        <details className={styles.request}>
          <summary>{c.request}</summary>
          {request ? <><p>{c.requestNote}</p><button className={styles.secondary} onClick={copyRequest}>{c.copy}</button><p role="status">{copyStatus}</p><pre tabIndex={0} aria-label={c.request}><code>{JSON.stringify(request, null, 2)}</code></pre></> : <p>{c.requestHint}</p>}
        </details>
        <a className={styles.reference} href={referenceUrl} target="_blank" rel="noopener noreferrer">{c.reference}</a>
      </section>

      <section className={styles.comparison} aria-labelledby="inputs-heading">
        <h2 id="inputs-heading">{c.inputs}</h2>
        <p className={styles.hint}>{c.inputNote}</p>
        <form onSubmit={(event) => { event.preventDefault(); setResult(compare(kind, rows, cost)); }} noValidate>
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={c.inputs}>
            <table><thead><tr><th scope="col">{c.outcome}</th><th scope="col">{c.probability}</th><th scope="col">{c.yes}</th><th scope="col">{c.no}</th></tr></thead>
              <tbody>{rows.map((row, i) => <tr key={i}>
                <th scope="row"><label className={styles.rowLabel}><span>{kind === "noul" ? "YES" : kind === "choice" ? `option_${i}` : `${i}`}</span><textarea aria-label={`${c.outcome} ${i + 1}`} rows={3} maxLength={500} value={row.label} onChange={(event) => updateRow(i, "label", event.target.value)} /></label></th>
                {(["probability", "yes", "no"] as const).map((field) => <td key={field}><input aria-label={`${c[field]} ${i + 1}`} type="number" inputMode="decimal" min="0" max="100" step="any" value={row[field]} placeholder="—" onChange={(event) => updateRow(i, field, event.target.value)} /></td>)}
              </tr>)}</tbody>
            </table>
          </div>
          <label className={styles.cost} htmlFor="market-cost">{c.cost}<input id="market-cost" type="number" inputMode="decimal" min="0" max="100" step="any" value={cost} aria-describedby="cost-hint" onChange={(event) => { setCost(event.target.value); setResult(null); }} /></label>
          <p id="cost-hint" className={styles.hint}>{c.costHint}</p>
          <button className={styles.primary} type="submit">{c.calculate}</button>
          {result?.error && <p className={styles.error} role="alert">{c.errors[result.error]}</p>}
        </form>

        <section className={styles.result} aria-live="polite" aria-labelledby="result-heading">
          <h2 id="result-heading">{c.result}</h2>
          {result?.rows ? <>
            <p className={styles.badge}>{c.resultBadge}</p>
            <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={c.result}>
              <table><thead><tr><th scope="col">{c.outcome}</th><th scope="col">{c.yesValue}</th><th scope="col">{c.noValue}</th></tr></thead>
                <tbody>{result.rows.map((row, i) => <tr key={i}><th scope="row">{rows[i].label}</th><td>{number(row.yes)}</td><td>{number(row.no)}</td></tr>)}</tbody>
              </table>
            </div>
            {result.score !== undefined && <p className={styles.score}>{c.score}: <strong>{result.score.toFixed(2)}</strong><span>{c.scoreNote}</span></p>}
            <p className={styles.hint}>{c.formula}</p><p className={styles.hint}>{c.resultNote}</p>
            <a className={styles.marketLink} href={selected.url} target="_blank" rel="noopener noreferrer">{c.market}</a>
          </> : <div className={styles.empty}><h3>{c.empty}</h3><p>{c.emptyHint}</p></div>}
        </section>
      </section>
    </div>
  </>;
}
