import { useEffect, useState } from "react";
import { safeParse } from "./utils";

const isBrowser = typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  return safeParse<T>(localStorage.getItem(key), fallback);
}

export function writeJSON<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function readString(key: string): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}

export function writeString(key: string, value: string) {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
}

export function removeKey(key: string) {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readJSON<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (v: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      if (hydrated) writeJSON(key, next);
      return next;
    });
  };

  return [state, setValue];
}
