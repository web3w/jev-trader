export type QuestionType = "noul" | "choice" | "score";
export type TradingInput = { type: QuestionType; question: string; context: string; criteria: string[] };
export type Answer = { type: QuestionType; noul?: number; choice?: string; score?: number; probabilities?: Record<string, number>; confidence?: number; legend?: Record<string, string> };
export type Evaluation = { source: "mock" | "jev"; model: string; answer: Answer; elapsedMs?: number };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("invalid_input");
  return value.trim();
}

export function validateInput(value: unknown): TradingInput {
  if (!record(value) || !["noul", "choice", "score"].includes(String(value.type))) throw new Error("invalid_input");
  const type = value.type as QuestionType;
  const question = text(value.question, 500);
  const context = text(value.context, 6000);
  let criteria: string[] = [];
  if (type !== "noul") {
    if (!Array.isArray(value.criteria) || value.criteria.length < 2 || value.criteria.length > (type === "score" ? 10 : 8)) throw new Error("invalid_input");
    criteria = value.criteria.map((item) => text(item, 160));
    if (new Set(criteria.map((item) => item.toLowerCase())).size !== criteria.length) throw new Error("invalid_input");
  }
  return { type, question, context, criteria };
}

export function buildQuestion(input: TradingInput) {
  // Stable keys keep arbitrary visitor labels out of the response object's keys.
  return { type: input.type, instructions: input.question,
    ...(input.type === "choice" ? { criteria: Object.fromEntries(input.criteria.map((label, i) => [`option_${i}`, label])) }
      : input.type === "score" ? { criteria: input.criteria } : {}) };
}

function probability(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

export function validateAnswer(value: unknown, input: TradingInput): Answer {
  if (!record(value) || value.type !== input.type) throw new Error("invalid_response");
  if (input.type === "noul") {
    if (!probability(value.noul)) throw new Error("invalid_response");
    return { type: "noul", noul: value.noul };
  }
  const keys = input.criteria.map((_, i) => input.type === "choice" ? `option_${i}` : String(i));
  if (!record(value.probabilities)) throw new Error("invalid_response");
  const distribution = value.probabilities;
  if (Object.keys(distribution).length !== keys.length || keys.some((key) => !probability(distribution[key]))) throw new Error("invalid_response");
  const probabilities = Object.fromEntries(keys.map((key) => [key, distribution[key] as number]));
  if (Math.abs(Object.values(probabilities).reduce((a, b) => a + b, 0) - 1) > .01) throw new Error("invalid_response");
  if (value.confidence !== undefined && !probability(value.confidence)) throw new Error("invalid_response");
  const confidence = value.confidence as number | undefined;
  if (input.type === "choice") {
    if (typeof value.choice !== "string" || !keys.includes(value.choice)) throw new Error("invalid_response");
    return { type: "choice", choice: value.choice, probabilities, ...(confidence !== undefined ? { confidence } : {}) };
  }
  if (typeof value.score !== "number" || !Number.isFinite(value.score) || value.score < 0 || value.score > keys.length - 1) throw new Error("invalid_response");
  return { type: "score", score: value.score, legend: Object.fromEntries(input.criteria.map((label, i) => [String(i), label])), probabilities, ...(confidence !== undefined ? { confidence } : {}) };
}

export function demoAnswer(input: TradingInput, random: () => number = Math.random): Answer {
  // Random data teaches the output contract; it does not evaluate the market or the visitor's text.
  if (input.type === "noul") return { type: "noul", noul: random() };
  const weights = input.criteria.map(() => 1 + Math.floor(random() * 100));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const values = weights.map((weight) => weight / total);
  const probabilities = Object.fromEntries(values.map((value, i) => [input.type === "choice" ? `option_${i}` : String(i), value]));
  // Illustrative normalized entropy, not a claim about TypeSafe's unpublished confidence formula.
  const entropy = -values.reduce((sum, p) => sum + p * Math.log(p), 0);
  const confidence = Math.max(0, Math.min(1, 1 - entropy / Math.log(values.length)));
  if (input.type === "choice") return { type: "choice", choice: `option_${weights.indexOf(Math.max(...weights))}`, probabilities, confidence };
  return { type: "score", score: values.reduce((sum, p, i) => sum + i * p, 0),
    legend: Object.fromEntries(input.criteria.map((label, i) => [String(i), label])), probabilities, confidence };
}
