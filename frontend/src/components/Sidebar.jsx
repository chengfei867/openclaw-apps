import { useMemo, useRef } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import TagFilter from './TagFilter.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useNoteStore } from '../store/noteStore.js';
import { useAuthStore } from '../store/authStore.js';

const formatTimestamp = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export default function Sidebar({ isOpen, onToggle }) {
  const fileInputRef = useRef(null);
  const notes = useNoteStore((state) => state.notes);
  const currentNoteId = useNoteStore((state) => state.currentNoteId);
  const searchTerm = useNoteStore((state) => state.searchTerm);
  const selectedTag = useNoteStore((state) => state.selectedTag);
  const setSearchTerm = useNoteStore((state) => state.setSearchTerm);
  const setSelectedTag = useNoteStore((state) => state.setSelectedTag);
  const selectNote = useNoteStore((state) => state.selectNote);
  const createNote = useNoteStore((state) => state.createNote);
  const importMd = useNoteStore((state) => state.importMd);
  const isLoading = useNoteStore((state) => state.isLoading);
  const error = useNoteStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);

  const tags = useMemo(() => {
    const map = new Map();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => map.set(tag.id, tag));
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesSearch =
        !query ||
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query);
      const matchesTag =
        !selectedTag ||
        note.tags?.some(
          (tag) => tag.id === selectedTag.id || tag.name === selectedTag.name
        );
      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await importMd(file);
    event.target.value = '';
  };

  return (
    <aside
      className={`flex h-full flex-col bg-white/70 backdrop-blur transition-[width] duration-300 dark:bg-slate-900/50 ${
        isOpen
          ? 'w-[280px] border-r border-slate-200/60 dark:border-slate-800/70'
          : 'w-0 border-transparent'
      }`}
    >
      <div
        className={`flex h-full flex-col gap-4 px-4 py-4 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-500/10 text-xs font-semibold text-indigo-600">
              MD
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                md-note
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => createNote({ title: 'Untitled', content: '' })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
            aria-label="New note"
            disabled={isLoading}
          >
            <Plus size={16} />
          </button>
          <ThemeToggle />
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/60 bg-white/70 text-slate-500 transition hover:text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300"
              aria-label="Collapse sidebar"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <SearchBar value={searchTerm} onSearch={setSearchTerm} />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tags
          </p>
          <TagFilter
            tags={tags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span>Notes</span>
            <span>{filteredNotes.length}</span>
          </div>
          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200/70 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800/70">
                No notes yet
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = note.id === currentNoteId;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => selectNote(note.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? 'border-indigo-400/60 bg-indigo-500/10 text-slate-900 shadow-sm dark:border-indigo-400/50 dark:bg-indigo-500/10'
                        : 'border-transparent bg-white/40 text-slate-700 hover:border-slate-200/70 hover:bg-white/80 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-slate-700/70 dark:hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">
                        {note.title || 'Untitled'}
                      </p>
                      {note.is_draft ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                          Draft
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatTimestamp(note.updated_at || note.created_at)}
                    </p>
                    {note.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="border-t border-slate-200/60 pt-4 dark:border-slate-800/60">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            className="hidden"
            onChange={handleImportChange}
          />
          <button
            type="button"
            onClick={handleImportClick}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-700"
          >
            <Upload size={14} />
            Import .md
          </button>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center justify-center rounded-2xl border border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 dark:border-slate-800/70 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-slate-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
