"use client";

import Link from "next/link";
import { useState } from "react";
import { isLocale, languages } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";
import { guideContent } from "./content";
import { scoreFaqPaths } from "@/app/faq/jev-score/routes";
import styles from "./page.module.css";

const sections = ["what-is-jev", "three-decisions", "in-the-trader", "parallel-evaluation"];
const sources = [
  { label: "TypeSafe AI / Introduction", href: "https://docs.typesafe.ai/introduction" },
  { label: "Noul", href: "https://docs.typesafe.ai/primitives/noul" },
  { label: "Choice", href: "https://docs.typesafe.ai/primitives/choice" },
  { label: "Score", href: "https://docs.typesafe.ai/primitives/score" },
  { label: "System One Models & Jev", href: "https://typesafe.ai/blog/introducing-system-one-models-and-jev" },
  { label: "System One / Evaluations", href: "https://evals.typesafe.ai/" },
  { label: "TypeSafe AI / Benchmarks", href: "https://typesafe.ai/" },
  { label: "Confidence", href: "https://docs.typesafe.ai/confidence" },
];

// Preserve the reference image's model order, ratios and dollar amounts; illustrated costs are not per-call API prices.
const speedBenchmarks = [
  { name: "Jev", provider: "TypeSafe AI", speed: 193.6, cost: 0.39 },
  { name: "Claude Haiku 4.5", provider: "Anthropic", speed: 6.2, cost: 19.49 },
  { name: "Claude Opus 5", provider: "Anthropic", speed: 2.1, cost: 176.05 },
  { name: "Claude Sonnet 5", provider: "Anthropic", speed: 1.0, cost: 117.38 },
  { name: "GPT-5.6-Luna", provider: "OpenAI", speed: 6.0, cost: 3.31 },
];

export default function JevGuide() {
  const { locale, messages, changeLanguage } = useLanguage();
  const copy = guideContent[locale];
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedPlaying, setSpeedPlaying] = useState(true);
  const primitive = copy.primitives[selected];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>‖ Jev Trader</Link>
        <span className={styles.headerLabel}>{copy.navTitle}</span>
        <div className={styles.headerActions}>
          <Link href="/" className={styles.back}>← {copy.back}</Link>
          <select aria-label={messages.language} value={locale} onChange={(event) => {
            const next = event.target.value;
            if (isLocale(next)) changeLanguage(next);
          }}>
            {languages.map((language) => <option key={language.code} value={language.code} lang={language.code}>{language.label}</option>)}
          </select>
        </div>
      </header>

      <main>
        <div className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
          </div>
          <div className={styles.heroDiagram} aria-hidden="true">
            <div className={styles.heroInput}>state + questions</div>
            <span className={styles.heroLine} />
            <div className={styles.jevNode}><span>Jev</span><small>Decision Layer</small></div>
            <span className={styles.heroLine} />
            <div className={styles.heroOutputs}><span>Noul</span><span>Choice</span><span>Score</span></div>
          </div>
        </div>

        <nav className={styles.contents} aria-label={copy.tocLabel}>
          {copy.sectionTitles.map((title, index) => <a key={sections[index]} href={`#${sections[index]}`}><span>0{index + 1}</span>{title}</a>)}
        </nav>

        <section id={sections[0]} className={styles.section}>
          <div className={styles.sectionHeading}><span>01</span><h2>{copy.sectionTitles[0]}</h2></div>
          <p className={styles.sectionIntro}>{copy.intro} <a className={styles.citation} href={sources[0].href} target="_blank" rel="noopener noreferrer">[1]</a></p>
          <ol className={styles.layerFlow}>
            {copy.layerLabels.map((label, index) => <li key={index}>
              <span className={styles.flowLabel}>{index === 0 ? "INPUT" : index === 1 ? "DECISION" : "ACTION"}</span>
              <h3>{label}</h3><p>{copy.layerNotes[index]}</p>
            </li>)}
          </ol>
        </section>

        <section id={sections[1]} className={styles.section}>
          <div className={styles.sectionHeading}><span>02</span><h2>{copy.sectionTitles[1]}</h2></div>
          <div className={styles.primitivePicker} role="group" aria-label={copy.sectionTitles[1]}>
            {copy.primitives.map((item, index) => <button type="button" key={item.name} aria-pressed={index === selected} aria-controls="primitive-example" onClick={() => setSelected(index)}>
              <span>{item.name}</span><small>{item.question}</small>
            </button>)}
          </div>
          {/* Probabilities are fixed teaching examples; switching only updates the display without model or trading calls. */}
          <div id="primitive-example" className={styles.example} aria-live="polite" aria-atomic="true">
            <div className={styles.exampleCopy}>
              <span className={styles.miniLabel}>{copy.exampleLabel}</span>
              <h3>{primitive.prompt}</h3>
              <p>{primitive.description}</p>
              <a className={styles.textLink} href={sources[selected + 1].href} target="_blank" rel="noopener noreferrer">{copy.readSource} ↗</a>
            </div>
            <div className={styles.result}>
              <span className={styles.miniLabel}>{copy.resultLabel}</span>
              <strong>{primitive.result}</strong>
              <div className={styles.distribution}>
                {primitive.outcomes.map((outcome) => <div className={styles.outcome} key={outcome.label}>
                  <div><span>{outcome.label}</span><span>{Math.round(outcome.value * 100)}%</span></div>
                  <div className={styles.bar} aria-hidden="true"><span style={{ width: `${outcome.value * 100}%` }} /></div>
                </div>)}
              </div>
            </div>
          </div>
          <p className={styles.note}>{copy.exampleNote}</p>
          <aside className={styles.faqCard}>
            <div><h3>{copy.scoreFaqTitle}</h3><p>{copy.scoreFaqDescription}</p></div>
            <Link href={scoreFaqPaths[locale]}>{copy.scoreFaqLink} →</Link>
          </aside>
          <h3 className={styles.subheading}>{copy.usesTitle}</h3>
          <div className={styles.uses}>{copy.uses.map((use, index) => <div key={index}><h4>{use.title}</h4></div>)}</div>
        </section>

        <section id={sections[2]} className={styles.section}>
          <div className={styles.sectionHeading}><span>03</span><h2>{copy.sectionTitles[2]}</h2></div>
          <ol className={styles.integration}>{copy.integrationSteps.map((step, index) => <li key={index}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>
          <aside className={styles.integrationNote}>{copy.integrationNote}</aside>
        </section>

        <section id={sections[3]} className={styles.section}>
          <div className={styles.sectionHeading}><span>04</span><h2>{copy.sectionTitles[3]}</h2></div>
          <figure className={styles.comparison} data-paused={!playing}>
            <figcaption><span>{copy.diagramNote} <a className={styles.citation} href={sources[4].href} target="_blank" rel="noopener noreferrer">[5]</a></span><button className={styles.motionControl} type="button" onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ" : "▷"} {playing ? copy.pause : copy.play}</button></figcaption>
            <div className={styles.lanes}>
              <div className={styles.serial}>
                <span className={styles.miniLabel}>AUTOREGRESSIVE</span><h3>{copy.serialTitle}</h3>
                <div className={styles.tokens} aria-hidden="true">{[1, 2, 3, 4, 5].map((token) => <span key={token}>t<sub>{token}</sub></span>)}</div>
                <div className={styles.serialTrack} aria-hidden="true"><span className={styles.packet} /></div>
              </div>
              <div className={styles.parallel}>
                <span className={styles.miniLabel}>PARALLEL EVALUATION</span><h3>{copy.parallelTitle}</h3>
                <div className={styles.parallelFlow}>
                  <span className={styles.sharedState}>{copy.stateLabel}</span>
                  <div className={styles.parallelRows}>{["Noul", "Choice", "Score"].map((name) => <div className={styles.parallelRow} key={name}><span className={styles.parallelTrack} aria-hidden="true"><span className={styles.packet} /></span><span>{name}</span></div>)}</div>
                  <span className={styles.answers}>{copy.answerLabel}</span>
                </div>
              </div>
            </div>
          </figure>
          <div id="model-speed-comparison" className={styles.speedComparison} data-paused={!speedPlaying}>
            <div className={styles.speedHeading}>
              <h3 id="speed-comparison-title">{copy.speedComparisonTitle}</h3>
              <button className={styles.motionControl} type="button" aria-controls="speed-comparison-table" onClick={() => setSpeedPlaying(!speedPlaying)}>
                <span aria-hidden="true">{speedPlaying ? "Ⅱ" : "▷"}</span> {speedPlaying ? copy.pause : copy.play}
              </button>
            </div>
            <p id="speed-comparison-intro" className={styles.note}>{copy.speedComparisonIntro}</p>
            <table id="speed-comparison-table" className={styles.speedTable} aria-labelledby="speed-comparison-title" aria-describedby="speed-comparison-intro speed-comparison-note">
              <thead><tr><th scope="col">{copy.speedModelLabel}</th><th scope="col">{copy.speedMultiplierLabel}</th><th scope="col">{copy.speedCostLabel}</th></tr></thead>
              {speedBenchmarks.map((model) => (
                <tbody key={model.name} data-featured={model.name === "Jev"}>
                  <tr>
                    <th scope="row"><span>{model.name}</span><small>{model.provider}</small></th>
                    <td><strong>{model.speed.toFixed(1)}<span>×</span></strong></td>
                    <td className={styles.speedCost}>${model.cost.toFixed(2)}</td>
                  </tr>
                  <tr aria-hidden="true" className={styles.speedTrackRow}><td colSpan={3}>
                    <div className={styles.speedTrack}>
                      {/* Compress speed differences with a square root so all models visibly move; text gives the actual ratios. */}
                      <span style={{ animationDuration: `${12 / Math.sqrt(model.speed)}s` }} />
                    </div>
                  </td></tr>
                </tbody>
              ))}
            </table>
            <p id="speed-comparison-note" className={styles.note}>{copy.speedComparisonNote} <a className={styles.citation} href={sources[6].href} target="_blank" rel="noopener noreferrer">[7]</a></p>
          </div>
        </section>

        <footer className={styles.sources}>
          <h2>{copy.sourcesTitle}</h2><p>{copy.sourcesNote}</p>
          <ol>{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a></li>)}</ol>
          <Link className={styles.returnLink} href="/">← {copy.back}</Link>
        </footer>
      </main>
    </div>
  );
}
