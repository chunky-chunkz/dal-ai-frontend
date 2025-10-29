/**
 * MemoryPanel Component
 * 
 * Displays all stored memories for the current user
 * with the ability to view and delete individual memories.
 */

import React, { useState, useEffect } from 'react';
import { MemoryItem } from '../types/api';
import { getMemories, deleteMemory } from '../api/client';
import './MemoryPanel.css';

export interface MemoryPanelProps {
  onMemoryDeleted?: (memoryId: string) => void;
  onError?: (error: string) => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({ 
  onMemoryDeleted, 
  onError 
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load memories on mount
  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMemories();
      
      if (response.success && response.data) {
        setMemories(response.data);
      } else {
        throw new Error('Failed to load memories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load memories';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memoryId: string) => {
    if (!confirm('Möchten Sie diese Erinnerung wirklich löschen?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set([...prev, memoryId]));
      const response = await deleteMemory(memoryId);
      
      if (response.success) {
        // Remove from local state
        setMemories(prev => prev.filter(m => m.id !== memoryId));
        
        if (onMemoryDeleted) {
          onMemoryDeleted(memoryId);
        }
      } else {
        throw new Error('Failed to delete memory');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete memory';
      alert(`Fehler beim Löschen: ${errorMessage}`);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memoryId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'preference': '⚙️ Präferenz',
      'profile_fact': '👤 Profil',
      'contact': '📧 Kontakt',
      'task_hint': '✅ Aufgabe',
      'other': '📌 Sonstiges'
    };
    return typeLabels[type] || type;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'confidence-high';
    if (confidence >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  };

  if (loading) {
    return (
      <div className="memory-panel">
        <div className="memory-panel-header">
          <h2>🧠 Meine Erinnerungen</h2>
        </div>
        <div className="memory-panel-loading">
          <div className="spinner"></div>
          <p>Lade Erinnerungen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="memory-panel">
        <div className="memory-panel-header">
          <h2>🧠 Meine Erinnerungen</h2>
        </div>
        <div className="memory-panel-error">
          <p>⚠️ {error}</p>
          <button onClick={loadMemories} className="retry-button">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="memory-panel">
        <div className="memory-panel-header">
          <h2>🧠 Meine Erinnerungen</h2>
          <button onClick={loadMemories} className="refresh-button">
            🔄 Aktualisieren
          </button>
        </div>
        <div className="memory-panel-empty">
          <p>📭 Noch keine Erinnerungen gespeichert.</p>
          <p className="memory-panel-hint">
            Während Sie mit dem Assistenten chatten, werden wichtige Informationen 
            automatisch als Erinnerungen gespeichert.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-panel">
      <div className="memory-panel-header">
        <h2>🧠 Meine Erinnerungen</h2>
        <div className="memory-panel-actions">
          <span className="memory-count">{memories.length} Erinnerung{memories.length !== 1 ? 'en' : ''}</span>
          <button onClick={loadMemories} className="refresh-button">
            🔄 Aktualisieren
          </button>
        </div>
      </div>

      <div className="memory-list">
        {memories.map((memory) => (
          <div key={memory.id} className="memory-item">
            <div className="memory-item-header">
              <span className="memory-type">{getTypeLabel(memory.type)}</span>
              <span className={`memory-confidence ${getConfidenceColor(memory.confidence)}`}>
                {Math.round(memory.confidence * 100)}%
              </span>
            </div>

            <div className="memory-item-content">
              <div className="memory-key">{memory.key}</div>
              <div className="memory-value">{memory.value}</div>
            </div>

            <div className="memory-item-footer">
              <span className="memory-date">
                📅 {formatDate(memory.createdAt)}
              </span>
              {memory.expiresAt && (
                <span className="memory-expires">
                  ⏰ Läuft ab: {formatDate(memory.expiresAt)}
                </span>
              )}
            </div>

            <button
              className="memory-delete-button"
              onClick={() => handleDelete(memory.id)}
              disabled={deletingIds.has(memory.id)}
            >
              {deletingIds.has(memory.id) ? '⏳ Löschen...' : '🗑️ Löschen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryPanel;
