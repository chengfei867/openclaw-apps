import { create } from 'zustand';
import api from '../api/client.js';

const NOTES_CACHE_KEY = 'md-note-notes';
const AUTOSAVE_DELAY = 2000;

const loadCachedNotes = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(NOTES_CACHE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((note) => ({
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : [],
    }));
  } catch (error) {
    return [];
  }
};

const persistNotes = (notes) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(notes));
};

const normalizeNote = (note) => ({
  ...note,
  tags: Array.isArray(note.tags) ? note.tags : [],
});

const sortNotes = (notes) => {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
    if (dateA !== dateB) {
      return dateB - dateA;
    }
    return (b.id || 0) - (a.id || 0);
  });
};

const mergeNote = (notes, nextNote) => {
  const index = notes.findIndex((note) => note.id === nextNote.id);
  if (index === -1) {
    return [nextNote, ...notes];
  }
  const updated = [...notes];
  updated[index] = { ...notes[index], ...nextNote };
  return updated;
};

const applyNoteUpdate = (notes, noteId, updates) => {
  return notes.map((note) =>
    note.id === noteId
      ? {
          ...note,
          ...updates,
          tags: Array.isArray(updates.tags) ? updates.tags : note.tags,
        }
      : note
  );
};

const resolveTagObjects = (tags, notes) => {
  if (!Array.isArray(tags)) {
    return tags;
  }
  if (tags.every((tag) => typeof tag === 'object')) {
    return tags;
  }
  const tagMap = new Map();
  notes.forEach((note) => {
    note.tags?.forEach((tag) => {
      tagMap.set(tag.id, tag);
    });
  });
  return tags
    .map((tag) => (typeof tag === 'object' ? tag : tagMap.get(tag)))
    .filter(Boolean);
};

const mapTagsToIds = (tags) => {
  if (!Array.isArray(tags)) {
    return undefined;
  }
  return tags
    .map((tag) => (typeof tag === 'object' ? tag.id : tag))
    .filter((tagId) => Number.isInteger(tagId));
};

const getErrorMessage = (error) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors[0].msg;
  }
  return 'Something went wrong. Please try again.';
};

const autoSaveTimers = new Map();

const clearAutoSave = (noteId) => {
  const timer = autoSaveTimers.get(noteId);
  if (timer) {
    clearTimeout(timer);
    autoSaveTimers.delete(noteId);
  }
};

export const useNoteStore = create((set, get) => {
  const initialNotes = loadCachedNotes();
  return {
    notes: initialNotes,
    currentNoteId: initialNotes[0]?.id ?? null,
    searchTerm: '',
    selectedTag: null,
    isLoading: false,
    error: null,
    clearError: () => set({ error: null }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setSelectedTag: (tag) => set({ selectedTag: tag }),
    selectNote: (noteId) => set({ currentNoteId: noteId }),
    fetchNotes: async (options = {}) => {
      set({ isLoading: true, error: null });
      try {
        const search = options.search ?? get().searchTerm;
        const selectedTag = options.tag ?? get().selectedTag;
        const params = {};
        if (search) {
          params.search = search;
        }
        if (selectedTag) {
          params.tag =
            typeof selectedTag === 'object'
              ? selectedTag.id ?? selectedTag.name
              : selectedTag;
        }
        const { data } = await api.get('/notes', { params });
        const notes = sortNotes(
          (data?.notes ?? []).map((note) => normalizeNote(note))
        );
        const currentId = get().currentNoteId;
        const hasCurrent = notes.some((note) => note.id === currentId);
        const nextCurrentId = hasCurrent
          ? currentId
          : notes[0]?.id ?? null;
        set({ notes, currentNoteId: nextCurrentId, isLoading: false });
        persistNotes(notes);
        return notes;
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
        throw error;
      }
    },
    createNote: async (payload = {}) => {
      set({ isLoading: true, error: null });
      try {
        const payloadToSend = { ...payload };
        const tagIds = mapTagsToIds(payloadToSend.tags);
        if (tagIds) {
          payloadToSend.tags = tagIds;
        }
        const { data } = await api.post('/notes', payloadToSend);
        const note = normalizeNote(data.note);
        set((state) => {
          const notes = sortNotes(mergeNote(state.notes, note));
          persistNotes(notes);
          return {
            notes,
            currentNoteId: note.id,
            isLoading: false,
          };
        });
        return note;
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
        throw error;
      }
    },
    updateNote: async (noteId, updates = {}, options = {}) => {
      if (!noteId) {
        return null;
      }
      const { optimistic = true } = options;
      if (optimistic) {
        const optimisticUpdates = {
          ...updates,
          tags: resolveTagObjects(updates.tags, get().notes),
          updated_at: new Date().toISOString(),
        };
        set((state) => {
          const notes = sortNotes(
            applyNoteUpdate(state.notes, noteId, optimisticUpdates)
          );
          persistNotes(notes);
          return { notes };
        });
      }
      try {
        const payload = { ...updates };
        const tagIds = mapTagsToIds(payload.tags);
        if (tagIds) {
          payload.tags = tagIds;
        }
        const { data } = await api.put(`/notes/${noteId}`, payload);
        const note = normalizeNote(data.note);
        set((state) => {
          const notes = sortNotes(mergeNote(state.notes, note));
          persistNotes(notes);
          return { notes };
        });
        return note;
      } catch (error) {
        set({ error: getErrorMessage(error) });
        throw error;
      }
    },
    deleteNote: async (noteId) => {
      if (!noteId) {
        return;
      }
      set({ isLoading: true, error: null });
      clearAutoSave(noteId);
      try {
        await api.delete(`/notes/${noteId}`);
        set((state) => {
          const notes = state.notes.filter((note) => note.id !== noteId);
          const nextCurrentId =
            state.currentNoteId === noteId ? notes[0]?.id ?? null : state.currentNoteId;
          persistNotes(notes);
          return {
            notes,
            currentNoteId: nextCurrentId,
            isLoading: false,
          };
        });
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
        throw error;
      }
    },
    importMd: async (file) => {
      if (!file) {
        return null;
      }
      set({ isLoading: true, error: null });
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post('/upload/md', formData);
        const note = normalizeNote(data);
        set((state) => {
          const notes = sortNotes(mergeNote(state.notes, note));
          persistNotes(notes);
          return {
            notes,
            currentNoteId: note.id,
            isLoading: false,
          };
        });
        return note;
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
        throw error;
      }
    },
    queueAutoSave: (noteId, updates = {}) => {
      if (!noteId) {
        return;
      }
      const stampedUpdates = {
        ...updates,
        tags: resolveTagObjects(updates.tags, get().notes),
        updated_at: new Date().toISOString(),
      };
      set((state) => {
        const notes = sortNotes(
          applyNoteUpdate(state.notes, noteId, stampedUpdates)
        );
        persistNotes(notes);
        return { notes };
      });
      clearAutoSave(noteId);
      autoSaveTimers.set(
        noteId,
        setTimeout(() => {
          autoSaveTimers.delete(noteId);
          const latest = get().notes.find((note) => note.id === noteId);
          if (!latest) {
            return;
          }
          const payload = {};
          if (Object.prototype.hasOwnProperty.call(updates, 'title')) {
            payload.title = latest.title;
          }
          if (Object.prototype.hasOwnProperty.call(updates, 'content')) {
            payload.content = latest.content;
          }
          if (Object.prototype.hasOwnProperty.call(updates, 'tags')) {
            payload.tags = latest.tags?.map((tag) => tag.id) ?? [];
          }
          if (Object.keys(payload).length === 0) {
            return;
          }
          get().updateNote(noteId, payload, { optimistic: false });
        }, AUTOSAVE_DELAY)
      );
    },
  };
});
