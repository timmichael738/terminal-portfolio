export const THEMES = {
  dracula: { label: 'Dracula', scheme: 'dark' },
  nord: { label: 'Nord', scheme: 'dark' },
  matrix: { label: 'Matrix', scheme: 'dark' },
  solarized: { label: 'Solarized Light', scheme: 'light' },
} as const;

export type ThemeName = keyof typeof THEMES;

export const isTheme = (value: string): value is ThemeName => value in THEMES;

const STORAGE_KEY = 'terminal-portfolio:theme';

export function loadTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isTheme(stored)) return stored;
  } catch {
    /* storage unavailable (private mode) */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'solarized' : 'dracula';
}

export function saveTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
