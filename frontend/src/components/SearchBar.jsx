import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ value = '', onSearch, placeholder }) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <label className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-white/70 px-3 py-2 text-sm text-slate-600 shadow-sm backdrop-blur transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/40">
      <Search size={16} className="text-slate-400 dark:text-slate-500" />
      <input
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
        type="search"
        value={query}
        placeholder={placeholder || 'Search notes...'}
        onChange={(event) => setQuery(event.target.value)}
      />
    </label>
  );
}
