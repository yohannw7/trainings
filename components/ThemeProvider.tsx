"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/defaults";
import type { ThemeName } from "@/lib/types";
import { hexToRgb, rgbToCss, rotateHue } from "@/lib/color";

const THEMES: ThemeName[] = ["midnight", "dawn", "ocean", "forest", "violet", "custom"];
const CUSTOM_KEY = "customAccent_v1";
const DEFAULT_CUSTOM = "#6366f1";

type Ctx = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  themes: ThemeName[];
  customAccent: string;
  setCustomAccent: (hex: string) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("midnight");
  const [customAccent, setCustomAccentState] = useState<string>(DEFAULT_CUSTOM);

  useEffect(() => {
    const savedTheme = (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeName | null) || "midnight";
    const savedCustom = localStorage.getItem(CUSTOM_KEY) || DEFAULT_CUSTOM;
    if (THEMES.includes(savedTheme)) setThemeState(savedTheme);
    setCustomAccentState(savedCustom);
    applyTheme(savedTheme, savedCustom);
  }, []);

  const setTheme = useCallback(
    (t: ThemeName) => {
      setThemeState(t);
      localStorage.setItem(STORAGE_KEYS.THEME, t);
      applyTheme(t, customAccent);
    },
    [customAccent],
  );

  const setCustomAccent = useCallback(
    (hex: string) => {
      setCustomAccentState(hex);
      localStorage.setItem(CUSTOM_KEY, hex);
      // Switching custom accent automatically activates the custom theme
      setThemeState("custom");
      localStorage.setItem(STORAGE_KEYS.THEME, "custom");
      applyTheme("custom", hex);
    },
    [],
  );

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, themes: THEMES, customAccent, setCustomAccent }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: ThemeName, customAccent: string) {
  const root = document.documentElement;
  // Reset any inline overrides from the previous custom theme
  root.style.removeProperty("--accent");
  root.style.removeProperty("--accent2");
  root.style.removeProperty("--success");
  root.style.removeProperty("--danger");

  if (theme === "midnight") {
    root.removeAttribute("data-theme");
  } else if (theme === "custom") {
    root.removeAttribute("data-theme");
    const rgb = hexToRgb(customAccent);
    if (rgb) {
      const accent2 = rotateHue(rgb, 35);
      root.style.setProperty("--accent", rgbToCss(rgb));
      root.style.setProperty("--accent2", rgbToCss(accent2));
    }
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
