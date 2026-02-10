import { useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import SplitView from '../components/SplitView.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useNoteStore } from '../store/noteStore.js';

export default function NotePage() {
  const token = useAuthStore((state) => state.token);
  const fetchNotes = useNoteStore((state) => state.fetchNotes);

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchNotes();
  }, [fetchNotes, token]);

  return (
    <Layout>
      <SplitView />
    </Layout>
  );
}
