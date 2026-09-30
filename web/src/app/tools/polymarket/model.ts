export type Kind = "noul" | "choice" | "score";
export type Row = { label: string; probability: string; yes: string; no: string };
type Comparison = { error?: "criteria" | "probability" | "sum" | "cost" | "price"; rows?: { yes: number | null; no: number | null }[]; score?: number };

function percent(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : null;
}

function validCriteria(criteria: string[]) {
  return criteria.every((label) => label.trim()) && new Set(criteria.map((label) => label.trim().toLowerCase())).size === criteria.length;
}

export function compare(kind: Kind, rows: Row[], cost: string): Comparison {
  if (!rows.length || !validCriteria(rows.map((row) => row.label)) || (kind !== "noul" && rows.length < 2)) return { error: "criteria" };
  const probabilities = rows.map((row) => percent(row.probability));
  if (probabilities.some((p) => p === null)) return { error: "probability" };
  const values = probabilities as number[];
  if (kind !== "noul" && Math.abs(values.reduce((sum, p) => sum + p, 0) - 100) > 0.01) return { error: "sum" };
  const costs = percent(cost);
  if (costs === null) return { error: "cost" };
  if (rows.some((row) => [row.yes, row.no].some((price) => price.trim() && percent(price) === null))) return { error: "price" };
  // Inputs are percentages and cents per share. A missing quote stays missing; prices are never normalized.
  return {
    rows: rows.map((row, i) => ({
      yes: row.yes.trim() ? values[i] - Number(row.yes) - costs : null,
      no: row.no.trim() ? 100 - values[i] - Number(row.no) - costs : null,
    })),
    ...(kind === "score" ? { score: values.reduce((sum, p, i) => sum + i * p / 100, 0) } : {}),
  };
}

export function makeRequest(kind: Kind, input: { question: string; rules: string; evidence: string; url: string; criteria: string[] }) {
  if (![input.question, input.rules, input.evidence].every((value) => value.trim())) return null;
  if (kind !== "noul" && (input.criteria.length < 2 || !validCriteria(input.criteria))) return null;
  return {
    model: "jev-latest",
    state: { market_url: input.url, resolution_rules: input.rules.trim(), evidence: input.evidence.trim() },
    questions: {
      market_outcome: {
        type: kind, instructions: input.question.trim(),
        ...(kind === "choice" ? { criteria: Object.fromEntries(input.criteria.map((label, i) => [`option_${i}`, label.trim()])) }
          : kind === "score" ? { criteria: input.criteria.map((label) => label.trim()) } : {}),
      },
    },
  };
}
