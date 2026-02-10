import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        {!isSidebarOpen ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute left-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-md backdrop-blur transition hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
        ) : null}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
