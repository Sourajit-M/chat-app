import { create } from "zustand";
import { DEFAULT_THEME, isThemeName, type ThemeName } from "../constants/themes";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const getInitialTheme = (): ThemeName => {
  const storedTheme = localStorage.getItem("chat-theme");

  if (storedTheme && isThemeName(storedTheme)) {
    return storedTheme;
  }

  return DEFAULT_THEME;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme =
      theme === "light" ? "light" : "dark";
    set({ theme });
  },
}));
