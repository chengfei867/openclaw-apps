import { useAuthStore } from '../store/authStore.js';

export default function NotePage() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          You are signed in
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Notes workspace will appear here in the next milestone.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
