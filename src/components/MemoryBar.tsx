

import React, { useState } from 'react';
import { MemoryItem } from '../types/api';
import { confirmMemory, rejectMemory } from '../api/client';
import './MemoryBar.css';

export interface MemoryBarProps {
  suggestions: MemoryItem[];
  onMemoryAction?: (action: 'confirmed' | 'rejected', items: MemoryItem[]) => void;
}

export const MemoryBar: React.FC<MemoryBarProps> = ({ suggestions, onMemoryAction }) => {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Don't render if no suggestions or all are hidden
  const visibleSuggestions = suggestions.filter(item => !hiddenIds.has(item.id));
  if (visibleSuggestions.length === 0) {
    return null;
  }

  const handleConfirm = async (item: MemoryItem) => {
    try {
      setProcessingIds(prev => new Set(prev).add(item.id));
      
      await confirmMemory([item.id]);
      
      // Hide the suggestion after successful confirmation
      setHiddenIds(prev => new Set(prev).add(item.id));
      
      // Notify parent component
      onMemoryAction?.('confirmed', [item]);
      
      console.log('✅ Memory confirmed:', item.key, '=', item.value);
    } catch (error) {
      console.error('❌ Failed to confirm memory:', error);
      alert('Fehler beim Speichern der Erinnerung. Bitte versuchen Sie es erneut.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleReject = async (item: MemoryItem) => {
    try {
      setProcessingIds(prev => new Set(prev).add(item.id));
      
      await rejectMemory([item.id]);
      
      // Hide the suggestion after successful rejection
      setHiddenIds(prev => new Set(prev).add(item.id));
      
      // Notify parent component
      onMemoryAction?.('rejected', [item]);
      
      console.log('❌ Memory rejected:', item.key, '=', item.value);
    } catch (error) {
      console.error('❌ Failed to reject memory:', error);
      alert('Fehler beim Verwerfen der Erinnerung. Bitte versuchen Sie es erneut.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const formatMemoryText = (item: MemoryItem): string => {
    // Format based on memory type
    switch (item.type) {
      case 'preference':
        return `dass Sie ${item.value}`;
      case 'profile_fact':
        return `dass ${item.key}: ${item.value}`;
      case 'contact':
        return `Ihre ${item.key}: ${item.value}`;
      case 'task_hint':
        return `Aufgabe: ${item.key} - ${item.value}`;
      default:
        return `${item.key}: ${item.value}`;
    }
  };

  return (
    <div className="memory-bar">
      <div className="memory-bar-header">
        <span className="memory-icon">🧠</span>
        <span className="memory-title">Soll ich mir das merken?</span>
      </div>
      
      <div className="memory-suggestions">
        {visibleSuggestions.map((item) => {
          const isProcessing = processingIds.has(item.id);
          
          return (
            <div key={item.id} className={`memory-suggestion ${isProcessing ? 'processing' : ''}`}>
              <div className="memory-text">
                <span className="memory-label">Merken:</span>
                <span className="memory-content">{formatMemoryText(item)}</span>
                {item.confidence && (
                  <span className="memory-confidence">
                    ({Math.round(item.confidence * 100)}%)
                  </span>
                )}
              </div>
              
              <div className="memory-actions">
                <button
                  className="memory-btn memory-btn-confirm"
                  onClick={() => handleConfirm(item)}
                  disabled={isProcessing}
                  title="Speichern"
                >
                  {isProcessing ? '⏳' : '✅'} Speichern
                </button>
                
                <button
                  className="memory-btn memory-btn-reject"
                  onClick={() => handleReject(item)}
                  disabled={isProcessing}
                  title="Verwerfen"
                >
                  {isProcessing ? '⏳' : '❌'} Verwerfen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryBar;
