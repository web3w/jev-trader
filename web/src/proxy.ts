import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const headers = new Headers(request.headers);
  // Derive language from the URL and overwrite any client-provided value.
  headers.set("x-page-language", path.startsWith("/zh/") ? "zh-CN" : path.startsWith("/ko/") ? "ko" : "en");
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\.).*)"],
};
