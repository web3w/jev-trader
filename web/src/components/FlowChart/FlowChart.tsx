"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { BlockEvent, Meta } from "@/lib/types";
import type { Messages } from "@/lib/i18n";
import { fmtConf, fmtInt, fmtPrice, fmtSigned } from "@/lib/format";
import { smoothPath } from "./smooth";
import styles from "./FlowChart.module.css";

const STEP = 10; // px per block
const ANCHOR_GAP = 88; // newest point sits this far from the right edge
const PAD_TOP = 84; // overlays live here
const PAD_BOTTOM = 72; // block strip + tag clearance
const EASE = 0.1; // scale easing per new block
const MIN_RANGE_PCT = 0.002; // floor of 0.20% of price, so bps noise stays calm
const CELL_W = 6;
const CELL_H = 18;
const TAG_W = 58;

function cellFill(e: BlockEvent): string {
  if (e.decision?.late) return "var(--late-cell)";
  const side = e.fill?.side ?? e.decision?.action;
  if (side === "buy") return "var(--buy-bar)";
  if (side === "sell") return "var(--sell-bar)";
  return "var(--hold-cell)";
}

export default function FlowChart({
  events,
  meta,
  latest,
  messages,
}: {
  events: BlockEvent[];
  meta: Meta | null;
  latest: BlockEvent | null;
  messages: Messages;
}) {
  const isHyperliquid = meta?.venue === "hyperliquid";
  const priceDecimals = isHyperliquid ? 3 : 6;
  const baseAsset = meta?.baseAsset ?? "MON";
  const panelRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<number | null>(null);
  const scaleRef = useRef<{ lo: number; hi: number; block: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize((s) =>
        Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5
          ? s
          : { w: Math.round(r.width), h: Math.round(r.height) },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  const model = useMemo(() => {
    const plotH = h - PAD_TOP - PAD_BOTTOM;
    if (w < 160 || plotH < 60) return null;

    const n = Math.max(2, Math.ceil((w - ANCHOR_GAP) / STEP) + 2);
    let series = events.slice(-n);
    const tail = series[series.length - 1];
    if (latest && (!tail || latest.block > tail.block)) series = [...series, latest].slice(-n);
    else if (latest && tail && latest.block === tail.block) series[series.length - 1] = latest;
    const last = series[series.length - 1];
    if (!last) return null;

    if (originRef.current === null) originRef.current = series[0].block;
    const origin = originRef.current;
    const fx = (b: number) => (b - origin) * STEP;

    // --- value scale: window min/max, floored to 0.20% of price, eased 10%/block
    let lo = Infinity;
    let hi = -Infinity;
    let sum = 0;
    for (const e of series) {
      if (e.mid < lo) lo = e.mid;
      if (e.mid > hi) hi = e.mid;
      sum += e.mid;
    }
    const mean = sum / series.length;
    const floor = Math.max(mean * MIN_RANGE_PCT, 1e-9);
    if (hi - lo < floor) {
      lo = mean - floor / 2;
      hi = mean + floor / 2;
    }
    const prev = scaleRef.current;
    if (prev) {
      if (prev.block === last.block) {
        lo = prev.lo;
        hi = prev.hi;
      } else {
        lo = prev.lo + (lo - prev.lo) * EASE;
        hi = prev.hi + (hi - prev.hi) * EASE;
      }
      // the eased band must still contain the data: shrink slowly, grow at once
      for (const e of series) {
        if (e.mid < lo) lo = e.mid;
        if (e.mid > hi) hi = e.mid;
      }
      if (hi - lo < floor) {
        const c = (hi + lo) / 2;
        lo = c - floor / 2;
        hi = c + floor / 2;
      }
    }
    scaleRef.current = { lo, hi, block: last.block };

    const range = hi - lo || 1;
    const fy = (p: number) => PAD_TOP + (1 - (p - lo) / range) * plotH;

    const pts = series.map((e) => [fx(e.block), fy(e.mid)] as const);
    const line = smoothPath(pts);
    const base = h - PAD_BOTTOM;
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${base} L${pts[0][0].toFixed(1)} ${base} Z`;

    const cells = series.map((e, i) => ({
      key: e.block,
      x: fx(e.block) - CELL_W / 2,
      fill: cellFill(e),
      opacity: i === series.length - 1 ? 1 : e.quote && e.quote.status === "sent" ? 0.6 : 0.82,
    }));

    const beads = series
      .filter((e) => e.fill)
      .map((e) => ({
        key: e.block,
        x: fx(e.block),
        y: fy(e.mid),
        fill: e.fill!.side === "buy" ? "var(--buy)" : "var(--sell)",
      }));

    const ticks = [0.25, 0.5, 0.75].map((f) => ({
      y: PAD_TOP + plotH * f,
      label: fmtPrice(lo + (1 - f) * range, priceDecimals),
    }));

    const byBlock = new Map(series.map((e) => [e.block, e]));

    return {
      line,
      area,
      cells,
      beads,
      hot: beads.length ? beads[beads.length - 1] : null,
      hotCell: cells[cells.length - 1],
      ticks,
      byBlock,
      fx,
      fy,
      last,
      base,
      shift: w - ANCHOR_GAP - fx(last.block),
      endY: fy(last.mid),
    };
  }, [events, latest, w, h, priceDecimals]);

  const hv = useMemo(() => {
    if (!model || hover === null) return null;
    const e = model.byBlock.get(hover);
    if (!e) return null;
    const x = model.fx(e.block);
    const tipWidth = isHyperliquid ? 190 : 132;
    const flip = x + model.shift > w - tipWidth - 36;
    const ty = Math.min(Math.max(model.fy(e.mid) - 92, PAD_TOP - 46), model.base - 82);
    const side = e.fill ? messages[e.fill.side].toUpperCase() : null;
    const q = e.quote;
    const quoteText = q ? `${q.side === "buy" ? messages.bid : messages.ask} ${fmtPrice(q.price, priceDecimals)}` : messages.noQuote;
    return {
      x,
      y: model.fy(e.mid),
      tx: flip ? x - tipWidth - 14 : x + 14,
      width: tipWidth,
      ty,
      // Drawing and hit testing use internal block IDs; labels show only observed real chain heads.
      block: isHyperliquid
        ? `${messages.observedBlock} ${e.chainBlock == null ? "-" : fmtInt(e.chainBlock)}`
        : `${messages.block} #${e.block}`,
      price: fmtPrice(e.mid, priceDecimals),
      trade: side ? `${messages.fill} ${side} ${e.fill!.size.toFixed(isHyperliquid ? 3 : 0)} ${baseAsset}` : quoteText,
      tint: e.fill ? (e.fill.side === "buy" ? "var(--buy-ink)" : "var(--sell-ink)") : q ? (q.side === "buy" ? "var(--buy-ink)" : "var(--sell-ink)") : "var(--muted)",
      lat: e.decision ? (!e.decision.late ? `${Math.round(e.decision.latencyMs)} ms` : messages.late) : isHyperliquid ? messages.noDecision : messages.late,
    };
  }, [model, hover, w, messages, priceDecimals, isHyperliquid, baseAsset]);

  const shown = latest ?? events[events.length - 1] ?? null;
  const d = shown?.decision ?? null;
  const late = d?.late === true;
  const act = late ? "late" : (d?.action ?? (isHyperliquid ? shown?.fill?.side : null) ?? "hold");
  const word = !d && isHyperliquid && shown?.fill ? messages.fill :
    act === "buy" ? messages.buying : act === "sell" ? messages.selling : act === "late" ? (isHyperliquid ? messages.missedUpdate : messages.missedBlock) : messages.holding;
  const wordColor =
    act === "buy"
      ? "var(--buy-ink)"
      : act === "sell"
        ? "var(--sell-ink)"
        : act === "late"
          ? "var(--late-ink)"
          : "var(--ink)";
  const wordRef = useRef<{ act: string; block: number }>({ act, block: shown?.block ?? 0 });
  if (wordRef.current.act !== act) wordRef.current = { act, block: shown?.block ?? 0 };
  const conf = d ? Math.max(d.probabilities.buy, d.probabilities.sell, d.probabilities.hold) : 0;
  const pos = shown?.position;
  const stance =
    !pos || pos.side === "flat"
      ? messages.flat
      : `${messages[pos.side]} ${pos.size.toFixed(Number.isInteger(pos.size) ? 0 : isHyperliquid ? 5 : 3)} ${baseAsset}`;
  const pnl = (isHyperliquid ? shown?.totals?.pnlUsd : shown?.totals?.pnlMon) ?? 0;
  const pnlPct = shown?.totals?.pnlPct ?? 0;

  return (
    <div className={styles.wrap}>
      <div
        ref={panelRef}
        className={styles.panel}
        onPointerMove={(ev) => {
          if (ev.pointerType !== "mouse" || !model || originRef.current === null) return;
          const r = ev.currentTarget.getBoundingClientRect();
          const b = Math.round((ev.clientX - r.left - model.shift) / STEP) + originRef.current;
          setHover(model.byBlock.has(b) ? b : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {!model || !shown ? (
          <div className={styles.empty}>{isHyperliquid ? messages.waitingMarketData : messages.waitingBlocks}</div>
        ) : (
          <>
            <svg className={styles.svg} viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
              <defs>
                <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(10,10,10,0.07)" />
                  <stop offset="100%" stopColor="rgba(10,10,10,0)" />
                </linearGradient>
              </defs>

              {model.ticks.map((t) => (
                <line key={t.y} className={styles.grid} x1="0" x2={w} y1={t.y} y2={t.y} />
              ))}

              <g className={styles.slide} style={{ transform: `translateX(${model.shift.toFixed(1)}px)` }}>
                <path d={model.area} fill={`url(#g${gid})`} />
                <path className={styles.line} d={model.line} />
                {model.beads.map((b) => (
                  <circle
                    key={b.key}
                    className={b.key === model.hot?.key ? styles.beadPop : undefined}
                    cx={b.x}
                    cy={b.y}
                    r="3"
                    fill={b.fill}
                    opacity="0.7"
                  />
                ))}
                {model.hot ? (
                  <g key={model.hot.key}>
                    <line
                      className={styles.riser}
                      x1={model.hot.x}
                      x2={model.hot.x}
                      y1={h - 40}
                      y2={model.hot.y}
                      stroke={model.hot.fill}
                    />
                    <circle
                      className={styles.ripple}
                      cx={model.hot.x}
                      cy={model.hot.y}
                      r="3"
                      fill="none"
                      stroke={model.hot.fill}
                      strokeWidth="2"
                    />
                  </g>
                ) : null}
                <rect
                  key={`glow${model.hotCell.key}`}
                  className={styles.cellGlow}
                  x={model.hotCell.x}
                  y={h - 40}
                  width={CELL_W}
                  height={CELL_H}
                  rx="3"
                  fill={model.hotCell.fill}
                />
                {model.cells.map((c, i) => (
                  <rect
                    key={c.key}
                    className={i === model.cells.length - 1 ? styles.cellPop : undefined}
                    x={c.x}
                    y={h - 40}
                    width={CELL_W}
                    height={CELL_H}
                    rx="3"
                    fill={c.fill}
                    opacity={c.opacity}
                  />
                ))}
                {hv ? (
                  <g>
                    <line className={styles.cross} x1={hv.x} x2={hv.x} y1={PAD_TOP - 12} y2={model.base + 10} />
                    <circle className={styles.crossDot} cx={hv.x} cy={hv.y} r="4.5" />
                    <g transform={`translate(${hv.tx.toFixed(1)},${hv.ty.toFixed(1)})`}>
                      {isHyperliquid ? <title>{messages.observedBlockHint}</title> : null}
                      <rect className={styles.tip} width={hv.width} height="78" rx="10" />
                      <text className={styles.tipBlock} x="12" y="21">{hv.block}</text>
                      <text className={styles.tipPrice} x="12" y="41">{hv.price}</text>
                      <text className={styles.tipSide} x="12" y="58" fill={hv.tint}>{hv.trade}</text>
                      <text className={styles.tipMeta} x="12" y="71">{hv.lat}</text>
                    </g>
                  </g>
                ) : null}
              </g>

              {model.ticks.map((t) => (
                <text key={`l${t.y}`} className={styles.tick} x={w - 8} y={t.y - 5} textAnchor="end">
                  {t.label}
                </text>
              ))}

              <g className={styles.tag} style={{ transform: `translateY(${model.endY.toFixed(1)}px)` }}>
                <line className={styles.guide} x1={w - ANCHOR_GAP + 8} x2={w - TAG_W - 6} y1="0" y2="0" />
                <circle className={styles.halo} cx={w - ANCHOR_GAP} cy="0" r="4" fill="var(--ink)" />
                <circle cx={w - ANCHOR_GAP} cy="0" r="4" fill="var(--ink)" />
                <rect x={w - TAG_W - 4} y="-10" width={TAG_W} height="20" rx="999" fill="var(--ink)" />
                <text className={styles.tagText} x={w - 4 - TAG_W / 2} y="4" textAnchor="middle">
                  {fmtPrice(model.last.mid, priceDecimals)}
                </text>
              </g>
            </svg>

            <div className={styles.fade} />

            <div className={styles.tl}>
              <div className={styles.price} key={shown.mid}>
                {fmtPrice(shown.mid, priceDecimals)}
              </div>
              <div className={styles.sub}>
                <span>{meta?.symbol ?? "MON/USDC"}</span>
                <span>{isHyperliquid ? "Hyperliquid" : "Kuru"}</span>
                <span>{stance}</span>
                <span style={{ color: pnl >= 0 ? "var(--pnl-pos)" : "var(--pnl-neg)" }}>
                  {messages.pnl} {fmtSigned(pnl, isHyperliquid ? 2 : 3)} {isHyperliquid ? "USDC" : "MON"} ({fmtSigned(pnlPct, 2)}%)
                </span>
              </div>
            </div>

            <div className={styles.tr}>
              <div
                className={`${styles.word} ${styles.wordPop}`}
                key={`${wordRef.current.block}-${act}`}
                style={{ color: wordColor }}
              >
                {word}
              </div>
              <div className={styles.sub}>
                <span>{!d ? (isHyperliquid ? messages.noDecision : messages.late) : late ? messages.late : `${Math.round(d.latencyMs)} ms`}</span>
                <span>{messages.confidence} {fmtConf(conf)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
