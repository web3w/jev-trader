import { expect, test } from "bun:test";
import { validateInput, validateAnswer, demoAnswer, buildQuestion } from "../src/app/tools/ask-jev-trading/model";

const input = { type: "choice", question: "Which action fits this snapshot?", context: "Fictional HYPE/USDC snapshot. Buying is disabled.", criteria: ["Buy", "Sell", "Wait"] };

test("rejects incomplete trading evidence and duplicate options", () => {
  expect(() => validateInput({ ...input, context: " " })).toThrow();
  expect(() => validateInput({ ...input, criteria: ["Buy", " buy "] })).toThrow();
  expect(() => validateInput({ ...input, question: "x".repeat(501) })).toThrow();
  expect(() => validateInput({ ...input, type: "score", criteria: Array(11).fill("level") })).toThrow();
});

test("keeps option labels as data, using stable keys in provider requests", () => {
  const parsed = validateInput({ ...input, criteria: ["__proto__", "Sell"] });
  expect(buildQuestion(parsed)).toEqual({ type: "choice", instructions: input.question, criteria: { option_0: "__proto__", option_1: "Sell" } });
});

test("rejects malformed probabilities and choices outside the supplied options", () => {
  const parsed = validateInput(input);
  expect(() => validateAnswer({ type: "choice", choice: "other", probabilities: { option_0: 1 } }, parsed)).toThrow();
  expect(() => validateAnswer({ type: "noul", noul: 1.5 }, validateInput({ ...input, type: "noul", criteria: [] }))).toThrow();
  expect(() => validateAnswer({ type: "choice", choice: "option_0", probabilities: { option_0: 0.4, option_1: 0.3, option_2: 0.1 } }, parsed)).toThrow();
});

test("preserves decimal scores, without treating them as a level index", () => {
  const parsed = validateInput({ ...input, type: "score", criteria: ["Very low", "Low", "Medium", "High", "Very high"] });
  expect(validateAnswer({ type: "score", score: 2.6, probabilities: { 0: .05, 1: .1, 2: .25, 3: .4, 4: .2 }, confidence: .2 }, parsed).score).toBe(2.6);
});

test("generated results follow the edited option count and Jev semantics", () => {
  for (const type of ["choice", "score"] as const) {
    for (const count of [2, 4, 8]) {
      const parsed = validateInput({ ...input, type, criteria: Array.from({ length: count }, (_, i) => `Custom ${i}`) });
      let draw = 0;
      const answer = demoAnswer(parsed, () => (++draw) / (count + 1));
      expect(Object.keys(answer.probabilities!).length).toBe(count);
      expect(Object.values(answer.probabilities!).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
      if (type === "choice") expect(answer.choice).toBe(`option_${count - 1}`);
      else {
        expect(answer.score).toBeCloseTo(Object.values(answer.probabilities!).reduce((sum, p, i) => sum + i * p, 0), 12);
        expect(answer.legend).toEqual(Object.fromEntries(parsed.criteria.map((label, i) => [i, label])));
      }
      expect(validateAnswer(answer, parsed).type).toBe(type);
    }
  }
});

test("each submission draws new demonstration data, including Noul", () => {
  const parsed = validateInput({ ...input, type: "noul", criteria: [] });
  expect(demoAnswer(parsed, () => .12)).toEqual({ type: "noul", noul: .12 });
  expect(demoAnswer(parsed, () => .87)).toEqual({ type: "noul", noul: .87 });
  expect(demoAnswer(parsed)).not.toHaveProperty("confidence");
});
