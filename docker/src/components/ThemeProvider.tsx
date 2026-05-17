"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "warm" | "dark";
interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "warm", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children, initial }: { children: ReactNode; initial: Theme }) {
  const [theme, setThemeState] = useState<Theme>(initial);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: t }) });
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
