import type { Locale } from "@/lib/i18n";
import { copy } from "./content";
import type { Evaluation, TradingInput } from "./model";

export type Conclusion = { version: 1; source: "mock" | "jev"; text: string };

export function createConclusion(input: TradingInput, result: Evaluation, locale: Locale): Conclusion {
  const c = copy[locale], a = result.answer;
  let text: string;
  if (a.type === "noul") {
    const p = a.noul!;
    text = `${p === .5 ? c.uncertain : p > .5 ? c.yes : c.no} · ${c.yesProbability}: ${(p * 100).toFixed(1)}%`;
  } else if (a.type === "choice") {
    const index = Number(a.choice!.replace("option_", ""));
    text = `${input.criteria[index]} · ${(a.probabilities![a.choice!] * 100).toFixed(1)}%`;
  } else text = `${c.types.score}: ${a.score!.toFixed(1)} / ${input.criteria.length - 1}`;
  // An explicit allowlist prevents a future form field from leaking into a share link.
  return { version: 1, source: result.source, text };
}

export function encodeConclusion(conclusion: Conclusion): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ version: 1, source: conclusion.source, text: conclusion.text }));
  return `#conclusion=${btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")}`;
}

export function decodeConclusion(hash: string): Conclusion {
  if (!hash.startsWith("#conclusion=") || hash.length > 4000) throw new Error("invalid_share");
  try {
    const encoded = hash.slice(12).replaceAll("-", "+").replaceAll("_", "/");
    const raw = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))));
    if (!raw || raw.version !== 1 || !["mock", "jev"].includes(raw.source) || typeof raw.text !== "string" || !raw.text.trim() || raw.text.length > 500) throw new Error();
    return { version: 1, source: raw.source, text: raw.text };
  } catch { throw new Error("invalid_share"); }
}
