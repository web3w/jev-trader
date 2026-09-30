import { expect, test } from "bun:test";
import { compare, makeRequest, type Row } from "../src/app/tools/polymarket/model";

const row = (probability = "60", yes = "55", no = "46"): Row => ({ label: "Outcome", probability, yes, no });

test("YES and NO use complementary probabilities and independent buy prices", () => {
  const result = compare("noul", [row()], "1");
  expect(result.error).toBeUndefined();
  expect(result.rows?.[0].yes).toBeCloseTo(4);
  expect(result.rows?.[0].no).toBeCloseTo(-7);
});

test("blank probabilities and blank costs cannot masquerade as zero", () => {
  expect(compare("noul", [row("")], "0").error).toBe("probability");
  expect(compare("noul", [row()], "").error).toBe("cost");
  expect(compare("noul", [row("0")], "0").rows?.[0].yes).toBe(-55);
});

test("missing quotes stay missing while valid zero quotes are calculated", () => {
  const result = compare("noul", [row("60", "", "0")], "0");
  expect(result.rows?.[0].yes).toBeNull();
  expect(result.rows?.[0].no).toBeCloseTo(40);
});

test("reject invalid numbers without clamping or normalizing", () => {
  for (const value of ["-1", "101", "NaN", "Infinity", "bad"]) {
    expect(compare("noul", [row(value)], "0").error).toBe("probability");
    expect(compare("noul", [row("60", value)], "0").error).toBe("price");
  }
  expect(compare("choice", [row("60"), { ...row("60"), label: "Other" }], "0").error).toBe("sum");
});

test("Score is weighted level index, not probability or basis points", () => {
  const rows = ["10", "20", "40", "20", "10"].map((p, i) => ({ ...row(p), label: `Level ${i}` }));
  const result = compare("score", rows, "0");
  expect(result.score).toBeCloseTo(2);
  expect(result.rows?.[2].yes).toBeCloseTo(-15);
});

test("invalid outcome labels block comparisons", () => {
  expect(compare("choice", [row("50"), row("50")], "0").error).toBe("criteria");
  expect(compare("score", [{ ...row(), label: "" }], "0").error).toBe("criteria");
});

test("request carries evidence and edits, with primitive-specific criteria", () => {
  const input = { question: "Which result?", rules: "Full rules", evidence: "Dated facts", url: "https://polymarket.com/event/example", criteria: ["NASDAQ", "NYSE", "Other"] };
  const choice = makeRequest("choice", input);
  expect(choice?.state.evidence).toBe("Dated facts");
  expect(choice?.questions.market_outcome).toEqual({ type: "choice", instructions: "Which result?", criteria: { option_0: "NASDAQ", option_1: "NYSE", option_2: "Other" } });
  expect(makeRequest("score", input)?.questions.market_outcome).toMatchObject({ criteria: input.criteria });
  expect(makeRequest("noul", input)?.questions.market_outcome).not.toHaveProperty("criteria");
  expect(makeRequest("choice", { ...input, evidence: " " })).toBeNull();
  expect(makeRequest("choice", { ...input, criteria: ["Same", "same"] })).toBeNull();
});
