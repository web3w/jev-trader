/** Formatting helpers — see CONTRACT.md. All are pure and SSR-safe. */

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function safe(n: number | null | undefined): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

/** 105416201 -> "105,416,201" */
export function fmtInt(n: number | null | undefined): string {
  return INT.format(Math.round(safe(n)));
}

/** 0.0222354 -> "0.022235" (6 decimals, MON/USDC ticks) */
export function fmtPrice(n: number | null | undefined, decimals = 6): string {
  return safe(n).toFixed(decimals);
}

/** 0.0045 -> "$0.0045"; negatives -> "-$0.0045" */
export function fmtUsd(n: number | null | undefined, d = 4): string {
  const v = safe(n);
  return `${v < 0 ? "-" : ""}$${Math.abs(v).toFixed(d)}`;
}

/** 0.0213 -> "0.021 MON" */
export function fmtMon(n: number | null | undefined, d = 3): string {
  return `${safe(n).toFixed(d)} MON`;
}

/** 0.62 -> "62%" */
export function fmtPct(p: number | null | undefined): string {
  return `${Math.round(safe(p) * 100)}%`;
}

/** 0.62 -> "0.62" (two-decimal confidence) */
export function fmtConf(p: number | null | undefined): string {
  return safe(p).toFixed(2);
}

/** Signed number with a forced +/- sign: (0.003, 3) -> "+0.003" */
export function fmtSigned(n: number | null | undefined, d = 3): string {
  const v = safe(n);
  return `${v >= 0 ? "+" : "-"}${Math.abs(v).toFixed(d)}`;
}

/** -0.0012 -> "-0.001 MON"; 0.003 -> "+0.003 MON" */
export function fmtSignedMon(n: number | null | undefined, d = 3): string {
  return `${fmtSigned(n, d)} MON`;
}

/** 0.0012 (a ratio) -> "+0.12%" */
export function fmtSignedPct(p: number | null | undefined, d = 2): string {
  return `${fmtSigned(safe(p) * 100, d)}%`;
}

/** 107 -> "107 ms" */
export function fmtMs(n: number | null | undefined): string {
  return `${Math.round(safe(n))} ms`;
}

/** Accepts ms- or seconds-epoch. Elapsed since `startedAt` as "04:13:42". */
export function uptime(startedAt: number | null | undefined, now: number = Date.now()): string {
  if (!startedAt || !Number.isFinite(startedAt)) return "00:00:00";
  const startMs = startedAt < 1e12 ? startedAt * 1000 : startedAt;
  return hhmmss(Math.max(0, now - startMs));
}

/** Milliseconds -> "hh:mm:ss" (hours are not capped at 24). */
export function hhmmss(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** "0x7F3a...9C4e" */
export function shortAddr(a: string | null | undefined): string {
  if (!a) return "";
  return a.length <= 12 ? a : `${a.slice(0, 6)}…${a.slice(-4)}`;
}

/** "0x8f2c..." */
export function shortTx(h: string | null | undefined): string {
  if (!h) return "";
  return h.length <= 6 ? h : `${h.slice(0, 6)}…`;
}

export function txUrl(h: string): string {
  return `https://monadvision.com/tx/${h}`;
}
