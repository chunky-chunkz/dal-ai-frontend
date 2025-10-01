/**
 * Enhanced Chat Component with Memory Integration
 * 
 * This example shows how to integrate the MemoryBar into an existing chat interface.
 * 
 * Key Integration Points:
 * 1. Parse memory suggestions from backend responses
 * 2. Display MemoryBar when suggestions are available  
 * 3. Handle memory confirmation/rejection
 * 4. Update chat state accordingly
 */

import React, { useState, useCallback } from 'react';
import MemoryBar from './MemoryBar';
import { MemoryItem } from '../types/api';
import { processResponseWithMemory } from '../utils/memoryParser';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  confidence?: number;
}

const ChatWithMemory: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memorySuggestions, setMemorySuggestions] = useState<MemoryItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate sending a message to the backend
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulate backend call - in real app, use your API client
      const mockResponse = simulateBackendResponse(text);
      
      // Process the response to extract memory suggestions
      const result = processResponseWithMemory(mockResponse, 'current-user');
      
      // Add bot message with clean text (without memory suggestions)
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: result.cleanText,
        timestamp: new Date(),
        confidence: 0.85
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Set memory suggestions if any were found
      if (result.hasMemorySuggestions) {
        setMemorySuggestions(result.suggestions);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        timestamp: new Date(),
        confidence: 0.1
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Handle memory action (confirm/reject)
  const handleMemoryAction = useCallback((action: 'confirmed' | 'rejected', items: MemoryItem[]) => {
    console.log(`Memory ${action}:`, items);
    
    // Remove processed suggestions
    setMemorySuggestions(prev => 
      prev.filter(suggestion => 
        !items.some(item => item.id === suggestion.id)
      )
    );
    
    // Add a system message to show what happened
    const actionMessage: ChatMessage = {
      id: `memory-${Date.now()}`,
      type: 'bot',
      content: action === 'confirmed' 
        ? `✅ Ich habe mir gemerkt: ${items.map(item => `${item.key}: ${item.value}`).join(', ')}`
        : `❌ Erinnerung verworfen: ${items.map(item => `${item.key}: ${item.value}`).join(', ')}`,
      timestamp: new Date(),
      confidence: 1.0
    };
    
    setMessages(prev => [...prev, actionMessage]);
    
    // In a real app, you might also:
    // - Refresh the user's memory context
    // - Update other UI components
    // - Send analytics events
  }, []);

  // Simulate backend response with memory suggestions
  const simulateBackendResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('kaffee')) {
      return "Das ist interessant! Kaffee ist ein beliebtes Getränk. (Ich kann mir merken: dass Sie gerne Kaffee trinken. Möchten Sie das speichern? ✅/❌)";
    }
    
    if (lowerInput.includes('berlin')) {
      return "Berlin ist eine tolle Stadt! (Ich kann mir merken: dass Wohnort: Berlin. Möchten Sie das speichern? ✅/❌)";
    }
    
    if (lowerInput.includes('entwickler') || lowerInput.includes('programm')) {
      return "Software-Entwicklung ist ein spannendes Feld! (Ich kann mir merken: dass Beruf: Software-Entwickler. Möchten Sie das speichern? ✅/❌)";
    }
    
    return "Das ist eine interessante Frage! Können Sie mir mehr dazu erzählen?";
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Chat mit Memory Integration</h2>
      
      {/* Chat Messages */}
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '16px',
        marginBottom: '16px',
        background: '#f8f9fa'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: message.type === 'user' ? '#3182ce' : '#e2e8f0',
              color: message.type === 'user' ? 'white' : '#2d3748',
              alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              marginLeft: message.type === 'user' ? 'auto' : '0',
              marginRight: message.type === 'user' ? '0' : 'auto'
            }}
          >
            <div>{message.content}</div>
            {message.confidence && (
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                Confidence: {Math.round(message.confidence * 100)}%
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
            Bot tippt...
          </div>
        )}
      </div>
      
      {/* Memory Suggestions Bar */}
      {memorySuggestions.length > 0 && (
        <MemoryBar 
          suggestions={memorySuggestions}
          onMemoryAction={handleMemoryAction}
        />
      )}
      
      {/* Chat Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Schreiben Sie eine Nachricht..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={() => sendMessage(inputText)}
          disabled={isLoading || !inputText.trim()}
          style={{
            padding: '12px 20px',
            background: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Senden
        </button>
      </div>
      
      {/* Test Suggestions */}
      <div style={{ marginTop: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
        <h4>Test-Nachrichten:</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'Ich trinke gerne Kaffee am Morgen',
            'Ich wohne in Berlin',
            'Ich arbeite als Software-Entwickler'
          ].map((testMessage) => (
            <button
              key={testMessage}
              onClick={() => sendMessage(testMessage)}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                background: '#e2e8f0',
                border: '1px solid #cbd5e0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {testMessage}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWithMemory;
