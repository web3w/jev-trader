import { expect, test } from "bun:test";
import { createConclusion, encodeConclusion, decodeConclusion } from "../src/app/tools/ask-jev-trading/share";
import { example } from "../src/app/tools/ask-jev-trading/content";


test("shares only the conclusion, never question, context, rubric or raw model data", () => {
  const input = { ...example("zh-CN", "choice"), question: "private-question-marker", context: "private-context-marker" };
  const conclusion = createConclusion(input, { source: "mock", model: "teaching-fixture", answer: { type: "choice", choice: "option_2", probabilities: { option_0: .2, option_1: .15, option_2: .65 } } }, "zh-CN");
  const link = encodeConclusion(conclusion);
  const decoded = decodeConclusion(link);
  expect(decoded.source).toBe("mock");
  expect(decoded.text).toContain("等待更明确的机会");
  expect(Object.keys(decoded).sort()).toEqual(["source", "text", "version"]);
  expect(JSON.stringify(decoded)).not.toContain("private-");
  expect(JSON.stringify(decoded)).not.toContain("probabilities");
});
test("handles multilingual conclusions and rejects malformed shared content", () => {
  const conclusion = { version: 1 as const, source: "jev" as const, text: "判断：等待 / 판단: 대기" };
  expect(decodeConclusion(encodeConclusion(conclusion))).toEqual(conclusion);
  expect(() => decodeConclusion("#conclusion=invalid")).toThrow();
  expect(() => decodeConclusion("#conclusion=" + "x".repeat(5000))).toThrow();
});
test("retains a decimal score in the shared conclusion", () => {
  const conclusion = createConclusion(example("en", "score"), { source: "mock", model: "fixture", answer: { type: "score", score: 2.6, probabilities: { 0: .05, 1: .1, 2: .25, 3: .4, 4: .2 } } }, "en");
  expect(conclusion.text).toContain("2.6 / 4");
});
