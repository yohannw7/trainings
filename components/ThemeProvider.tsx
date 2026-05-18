"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";
import type { ThemeName } from "@/lib/types";

const THEMES: ThemeName[] = ["midnight", "dawn", "ocean", "forest", "violet"];

type Ctx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: ThemeName[];
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("midnight");

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeName | null) || "midnight";
    if (THEMES.includes(saved)) {
      setThemeState(saved);
      applyTheme(saved);
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEYS.THEME, t);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: ThemeName) {
  if (theme === "midnight") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
