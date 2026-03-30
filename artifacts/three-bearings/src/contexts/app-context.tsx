import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type Lang, type UITranslations, UI } from "@/lib/i18n";

type Theme = "light" | "dark";

interface AppContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  T: UITranslations;
}

const AppContext = createContext<AppContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("tb_lang") as Lang) ?? "ru";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("tb_theme") as Theme) ?? "light";
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("tb_lang", l);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("tb_theme", t);
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, T: UI[lang] }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
