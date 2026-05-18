"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALES, getDefaultLocale, translate, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "locale_v1";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) => string;
  locales: Locale[];
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && LOCALES.includes(saved)) {
      setLocaleState(saved);
    } else {
      setLocaleState(getDefaultLocale());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
