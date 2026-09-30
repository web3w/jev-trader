import { demoAnswer, validateInput } from "../model";

export const runtime = "nodejs";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
function failure(error: string, status: number) {
  return Response.json({ error }, { status, headers });
}
export async function GET() {
  return Response.json({ mode: "demo" }, { headers });
}

export async function POST(request: Request) {
  // Next may use localhost internally; compare against the host actually requested by the browser.
  const url = new URL(request.url);
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.slice(0, -1);
  const publicOrigin = `${protocol}://${request.headers.get("host") ?? url.host}`;
  if (request.headers.get("origin") !== publicOrigin) return failure("forbidden", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("invalid_input", 415);
  const reader = request.body?.getReader();
  if (!reader) return failure("invalid_input", 400);
  let raw = "", size = 0;
  const decoder = new TextDecoder();
  // Enforce the byte cap while reading, including requests without Content-Length.
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24_000) { await reader.cancel(); return failure("invalid_input", 413); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return failure("invalid_input", 400); }
  let input;
  try { input = validateInput(JSON.parse(raw)); } catch { return failure("invalid_input", 400); }
  // The current product is an educational prototype: no credentials or external inference are used.
  return Response.json({ source: "mock", model: "jev-format-demo", answer: demoAnswer(input) }, { headers });
}
