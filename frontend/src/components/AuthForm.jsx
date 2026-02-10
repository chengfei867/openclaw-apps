import { useState } from 'react';
import { ArrowRight, Lock, User } from 'lucide-react';

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  footer,
  error,
  passwordAutoComplete = 'current-password',
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ username, password });
    } catch (submitError) {
      // Error is handled by parent.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-indigo-100 to-slate-200 px-4 py-12 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/20" />
      <div className="pointer-events-none absolute -bottom-16 right-6 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-600/20" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-300">
              md-note
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            ) : null}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm text-slate-600 dark:text-slate-300">
              Username
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-slate-700 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/40">
                <User size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block text-sm text-slate-600 dark:text-slate-300">
              Password
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-slate-700 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-200 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/40">
                <Lock size={18} className="text-slate-400 dark:text-slate-500" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  type="password"
                  name="password"
                  autoComplete={passwordAutoComplete}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {isSubmitting ? 'Please wait...' : submitLabel}
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </button>
          </form>

          {footer ? <div className="mt-6 text-center">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
