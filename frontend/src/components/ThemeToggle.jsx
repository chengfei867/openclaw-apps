import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore.js';

export default function ThemeToggle({ className = '' }) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/70 text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-indigo-400 ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
