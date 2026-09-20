"use client";

import { useEffect, useState } from "react";
import { isLocale, messages, type Locale } from "./i18n";

const STORAGE_KEY = "jev-trader-language";

export function useLanguage() {
  // Render English initially and restore preferences after mounting to avoid hydration mismatches.
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLocale(saved)) setLocale(saved);
    } catch {
      // Allow language switching on the current page even when local storage is disabled.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLanguage = (next: Locale) => {
    setLocale(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A storage failure does not prevent this language change.
    }
  };

  return { locale, messages: messages[locale], changeLanguage };
}
