import { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useThemeStore } from '../store/themeStore.js';

const baseTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    height: '100%',
  },
  '.cm-scroller': {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '1.25rem',
    lineHeight: '1.65',
    fontSize: '0.95rem',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
  },
  '.cm-line': {
    padding: '0 2px',
  },
});

export default function NoteEditor({ value = '', onChange }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const ignoreUpdateRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const themeCompartmentRef = useRef(new Compartment());
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || viewRef.current) {
      return undefined;
    }

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged || ignoreUpdateRef.current) {
        return;
      }
      const nextValue = update.state.doc.toString();
      if (onChangeRef.current) {
        onChangeRef.current(nextValue);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        markdown(),
        EditorView.lineWrapping,
        updateListener,
        baseTheme,
        themeCompartmentRef.current.of(theme === 'dark' ? oneDark : []),
      ],
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [theme, value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        theme === 'dark' ? oneDark : []
      ),
    });
  }, [theme]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }
    const currentValue = view.state.doc.toString();
    if (value === currentValue) {
      return;
    }
    ignoreUpdateRef.current = true;
    view.dispatch({
      changes: { from: 0, to: currentValue.length, insert: value },
    });
    ignoreUpdateRef.current = false;
  }, [value]);

  return <div ref={containerRef} className="h-full w-full" />;
}
