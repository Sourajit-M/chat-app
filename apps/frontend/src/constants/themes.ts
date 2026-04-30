export const THEMES = [
  "light",
  "dark",
] as const;

export type ThemeName = (typeof THEMES)[number];

export const DEFAULT_THEME: ThemeName = "light";

export const isThemeName = (theme: string): theme is ThemeName =>
  (THEMES as readonly string[]).includes(theme);
