import { afterEach, expect, test, spyOn, mock } from "bun:test";
import { GET, POST } from "../src/app/tools/ask-jev-trading/evaluate/route";

afterEach(() => mock.restore());
const payload = { type: "choice", question: "Which action fits this snapshot?", context: "Fictional snapshot. Spread 10 bps.", criteria: ["Buy", "Sell", "Wait", "Reduce exposure"] };
function request(body: unknown = payload, origin = "http://localhost:3010") {
  return new Request("http://localhost:3010/tools/ask-jev-trading/evaluate", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) });
}
test("all submissions produce demo data without requesting an external model", async () => {
  const external = spyOn(globalThis, "fetch");
  expect(await (await GET()).json()).toEqual({ mode: "demo" });
  const result = await (await POST(request())).json();
  expect(result.source).toBe("mock");
  expect(result.model).toBe("jev-format-demo");
  expect(Object.keys(result.answer.probabilities)).toHaveLength(4);
  expect(external).not.toHaveBeenCalled();
});
test("rejects cross-origin calls and invalid input", async () => {
  expect((await POST(request(payload, "https://unrelated.example"))).status).toBe(403);
  expect((await POST(request({ ...payload, question: "" }))).status).toBe(400);
});
test("rejects large bodies even without a content-length header", async () => {
  expect((await POST(request({ ...payload, context: "x".repeat(25000) }))).status).toBe(413);
});
test("score results match edited levels and their weighted probabilities", async () => {
  const result = await (await POST(request({ ...payload, type: "score", criteria: ["Low", "Medium", "High"] }))).json();
  expect(result.answer.legend).toEqual({ 0: "Low", 1: "Medium", 2: "High" });
  expect(result.answer.score).toBeCloseTo(result.answer.probabilities[1] + 2 * result.answer.probabilities[2], 12);
});

test("accepts the public host when Next uses an internal request URL", async () => {
  const proxied = new Request("http://localhost:3010/tools/ask-jev-trading/evaluate", {
    method: "POST", headers: { host: "127.0.0.1:3010", origin: "http://127.0.0.1:3010", "content-type": "application/json" }, body: JSON.stringify(payload),
  });
  expect((await POST(proxied)).status).toBe(200);
});
