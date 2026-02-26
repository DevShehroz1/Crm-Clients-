"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  loadSettings,
  updateAppearance,
  type AppearanceSettings,
  ACCENT_COLORS,
} from "@/lib/settings";

type ThemeProviderValue = {
  settings: { appearance: AppearanceSettings };
  updateAppearance: typeof updateAppearance;
};

const ThemeContext = createContext<ThemeProviderValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    const a = settings.appearance;
    const root = document.documentElement;

    let theme: "light" | "dark" = "light";
    if (a.theme === "dark") theme = "dark";
    else if (a.theme === "system") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    root.classList.toggle("dark", theme === "dark");

    root.setAttribute("data-accent", a.accent);
    if (a.accent === "custom" && a.accentHex) {
      root.style.setProperty("--accent", a.accentHex);
      root.style.setProperty("--accent-hover", a.accentHex);
    }

    root.setAttribute("data-density", a.density);
    root.setAttribute("data-font-size", a.fontSize);
    root.setAttribute("data-reduce-motion", a.reduceMotion ? "true" : "false");
  }, [settings.appearance]);

  const handleUpdate = (patch: Partial<AppearanceSettings>) => {
    const next = updateAppearance(patch);
    setSettings(next);
    return next;
  };

  return (
    <ThemeContext.Provider
      value={{
        settings: { appearance: settings.appearance },
        updateAppearance: handleUpdate,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
