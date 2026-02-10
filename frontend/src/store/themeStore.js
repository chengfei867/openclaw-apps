import { create } from 'zustand';

const THEME_KEY = 'md-note-theme';

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const useThemeStore = create((set, get) => {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);
  return {
    theme: initialTheme,
    setTheme: (theme) => {
      const nextTheme = theme === 'dark' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    },
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    },
  };
});
