import { useMemo, useState } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import NoteEditor from './NoteEditor.jsx';
import NotePreview from './NotePreview.jsx';
import { useNoteStore } from '../store/noteStore.js';

const VIEW_MODES = [
  { id: 'edit', label: 'Edit' },
  { id: 'split', label: 'Split' },
  { id: 'preview', label: 'Preview' },
];

const formatPlaceholder = () => {
  return 'Select a note or create a new one to get started.';
};

export default function SplitView() {
  const notes = useNoteStore((state) => state.notes);
  const currentNoteId = useNoteStore((state) => state.currentNoteId);
  const createNote = useNoteStore((state) => state.createNote);
  const updateNote = useNoteStore((state) => state.updateNote);
  const queueAutoSave = useNoteStore((state) => state.queueAutoSave);
  const deleteNote = useNoteStore((state) => state.deleteNote);

  const [mode, setMode] = useState('split');

  const currentNote = useMemo(() => {
    return notes.find((note) => note.id === currentNoteId) || null;
  }, [notes, currentNoteId]);

  const availableTags = useMemo(() => {
    const tagMap = new Map();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [notes]);

  const handleContentChange = (nextValue) => {
    if (!currentNote) {
      return;
    }
    queueAutoSave(currentNote.id, { content: nextValue });
  };

  const handleTitleChange = (event) => {
    if (!currentNote) {
      return;
    }
    queueAutoSave(currentNote.id, { title: event.target.value });
  };

  const toggleTag = async (tag) => {
    if (!currentNote) {
      return;
    }
    const currentTags = currentNote.tags || [];
    const hasTag = currentTags.some((item) => item.id === tag.id);
    const nextTags = hasTag
      ? currentTags.filter((item) => item.id !== tag.id)
      : [...currentTags, tag];
    await updateNote(currentNote.id, { tags: nextTags });
  };

  const handleDelete = async () => {
    if (!currentNote) {
      return;
    }
    const confirmed = window.confirm('Delete this note?');
    if (!confirmed) {
      return;
    }
    await deleteNote(currentNote.id);
  };

  if (!currentNote) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-500">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {formatPlaceholder()}
          </p>
          <button
            type="button"
            onClick={() => createNote({ title: 'Untitled', content: '' })}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
          >
            Create first note
          </button>
        </div>
      </div>
    );
  }

  const selectedTagIds = new Set(
    (currentNote.tags || []).map((tag) => tag.id)
  );

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200/60 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/50">
        <div className="min-w-[200px] flex-1">
          <input
            value={currentNote.title || ''}
            onChange={handleTitleChange}
            className="w-full rounded-2xl border border-transparent bg-transparent px-3 py-2 text-base font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white/80 focus:ring-2 focus:ring-indigo-200 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-900/80 dark:focus:ring-indigo-500/40"
            placeholder="Untitled"
          />
        </div>
        <div className="flex max-w-full items-center gap-2">
          <Tag size={14} className="text-slate-400" />
          <div className="flex max-w-[240px] items-center gap-2 overflow-x-auto pb-1">
            {availableTags.length === 0 ? (
              <span className="text-xs text-slate-400">No tags yet</span>
            ) : (
              availableTags.map((tag) => {
                const isActive = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 hover:text-slate-800 dark:text-slate-200 dark:hover:text-white'
                    }`}
                    style={{
                      borderColor: tag.color || '#6366f1',
                      backgroundColor: isActive ? tag.color || '#6366f1' : 'transparent',
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-200/70 bg-white/70 p-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200">
            {VIEW_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-full px-3 py-1 transition ${
                  mode === item.id
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {mode !== 'preview' ? (
          <div
            className={`flex-1 overflow-hidden bg-white/70 transition-all duration-300 dark:bg-slate-900/50 ${
              mode === 'split'
                ? 'border-r border-slate-200/60 dark:border-slate-800/70'
                : ''
            }`}
          >
            <NoteEditor value={currentNote.content || ''} onChange={handleContentChange} />
          </div>
        ) : null}
        {mode !== 'edit' ? (
          <div className="flex-1 overflow-y-auto bg-white/70 p-6 transition-all duration-300 dark:bg-slate-900/50">
            <NotePreview content={currentNote.content || ''} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
