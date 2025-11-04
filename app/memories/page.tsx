"use client";
import React, { useEffect, useState } from 'react';
import { getMemories, deleteMemory } from '../../src/api/client';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getMemories();
      // Support different shapes returned by API
      const items = res?.data || res?.memories || [];
      setMemories(items);
    } catch (error) {
      console.error('Failed to load memories', error);
      alert('Fehler beim Laden der Erinnerungen');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm('Soll diese Erinnerung endgültig gelöscht werden?');
    if (!ok) return;

    setDeletingId(id);

    // Optimistic update
    const previous = memories;
    setMemories(m => m.filter(item => item.id !== id));

    try {
      await deleteMemory(id);
      // Optionally show a success toast (simple alert for now)
      // alert('Erinnerung gelöscht');
    } catch (error) {
      console.error('Delete failed', error);
      alert('Löschen fehlgeschlagen');
      setMemories(previous);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Meine Erinnerungen</h1>

      {loading && <p>Lade Erinnerungen…</p>}

      {!loading && memories.length === 0 && (
        <p>Keine Erinnerungen gefunden.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {memories.map(mem => (
          <li key={mem.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{mem.key}</div>
              <div>{mem.value}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{new Date(mem.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <button
                onClick={() => handleDelete(mem.id)}
                disabled={deletingId === mem.id}
                style={{ padding: '6px 10px' }}
              >
                {deletingId === mem.id ? 'Lösche…' : 'Löschen'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
