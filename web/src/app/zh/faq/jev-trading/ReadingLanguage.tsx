"use client";

import { useEffect } from "react";

export default function ReadingLanguage({ locale = "zh-CN" }: { locale?: "en" | "zh-CN" }) {
  useEffect(() => {
    // Match the existing FAQ language behavior without making article rendering depend on storage.
    document.documentElement.lang = locale;
    try { localStorage.setItem("jev-trader-language", locale); } catch { /* Reading works without storage. */ }
  }, [locale]);
  return null;
}
