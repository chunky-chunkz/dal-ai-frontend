/**
 * MemoryBarDemo - Example usage of the MemoryBar component
 * 
 * This demonstrates how to integrate the MemoryBar into your chat interface.
 */

import React, { useState } from 'react';
import MemoryBar from './MemoryBar';
import { MemoryItem } from '../types/api';

const MemoryBarDemo: React.FC = () => {
  // Example memory suggestions that would come from the backend
  const [memorySuggestions, setMemorySuggestions] = useState<MemoryItem[]>([
    {
      id: 'suggestion-1',
      userId: 'demo-user',
      type: 'preference',
      key: 'lieblingsgetränk',
      value: 'gerne Kaffee trinken',
      confidence: 0.85,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'suggestion-2',
      userId: 'demo-user', 
      type: 'profile_fact',
      key: 'beruf',
      value: 'Software-Entwickler',
      confidence: 0.92,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'suggestion-3',
      userId: 'demo-user',
      type: 'contact',
      key: 'wohnort',
      value: 'Berlin',
      confidence: 0.78,
      createdAt: new Date().toISOString(),
    }
  ]);

  const handleMemoryAction = (action: 'confirmed' | 'rejected', items: MemoryItem[]) => {
    console.log(`Memory ${action}:`, items);
    
    // Remove processed suggestions from the list
    setMemorySuggestions(prev => 
      prev.filter(suggestion => 
        !items.some(item => item.id === suggestion.id)
      )
    );
    
    // In a real app, you might also:
    // - Update the chat context
    // - Refresh user memories
    // - Show a success message
  };

  const addTestSuggestion = () => {
    const newSuggestion: MemoryItem = {
      id: `suggestion-${Date.now()}`,
      userId: 'demo-user',
      type: 'preference',
      key: 'musik',
      value: 'gerne Jazz hören',
      confidence: 0.75,
      createdAt: new Date().toISOString(),
    };
    
    setMemorySuggestions(prev => [...prev, newSuggestion]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>MemoryBar Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={addTestSuggestion}
          style={{
            padding: '8px 16px',
            background: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Add Test Suggestion
        </button>
      </div>

      {/* This is how you would integrate MemoryBar into your chat */}
      <MemoryBar 
        suggestions={memorySuggestions}
        onMemoryAction={handleMemoryAction}
      />
      
      {memorySuggestions.length === 0 && (
        <p style={{ 
          textAlign: 'center', 
          color: '#718096', 
          fontStyle: 'italic',
          padding: '20px',
          background: '#f7fafc',
          borderRadius: '8px'
        }}>
          Keine Memory-Vorschläge vorhanden. Fügen Sie einen Test-Vorschlag hinzu!
        </p>
      )}
      
      <div style={{ marginTop: '30px', padding: '16px', background: '#f0fff4', borderRadius: '8px' }}>
        <h3>Integration Guide:</h3>
        <ol style={{ marginLeft: '20px' }}>
          <li>Import the MemoryBar component in your chat interface</li>
          <li>Parse memory suggestions from backend responses (look for text like "(Ich kann mir merken: ...)")</li>
          <li>Extract MemoryItem objects from the suggestions</li>
          <li>Pass them to the MemoryBar component</li>
          <li>Handle the onMemoryAction callback to update your UI</li>
        </ol>
        
        <h4>Backend Integration:</h4>
        <ul style={{ marginLeft: '20px' }}>
          <li>The backend already appends memory suggestions to responses</li>
          <li>Parse the response text and extract suggestions</li>
          <li>Convert to MemoryItem format with unique IDs</li>
          <li>The MemoryBar will handle the API calls to confirm/reject</li>
        </ul>
      </div>
    </div>
  );
};

export default MemoryBarDemo;
