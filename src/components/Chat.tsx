/**
 * Chat component with messages[], input, loading, error state
 * Uses ask() and sendFeedback() functions from api/client
 * Persists chat history in localStorage per session
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ask, 
  sendFeedback, 
  loadChatHistory, 
  saveChatHistory, 
  clearChatHistory,
  getCurrentSessionId,
  type AnswerResponse, 
  type FeedbackRequest,
  type ChatMessage 
} from '../api/client';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  confidence?: number;
  sourceId?: string;
  feedback?: boolean; // true = helpful, false = not helpful, undefined = no feedback yet
}

interface ChatProps {
  className?: string;
  placeholder?: string;
  welcomeMessage?: string;
}

/**
 * Convert stored ChatMessage to local Message format
 */
function convertStoredMessage(stored: ChatMessage): Message {
  return {
    ...stored,
    timestamp: new Date(stored.timestamp)
  };
}

/**
 * Convert local Message to storable ChatMessage format
 */
function convertToStoredMessage(message: Message): ChatMessage {
  return {
    ...message,
    timestamp: message.timestamp.toISOString()
  };
}

export default function Chat({ 
  className = '', 
  placeholder = 'Stellen Sie Ihre Frage zur Telekommunikation...',
  welcomeMessage = 'Hallo! Ich bin Ihr KI-Assistent für Telekommunikationsfragen. Wie kann ich Ihnen helfen?'
}: ChatProps) {
  // Load chat history on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = loadChatHistory();
    if (stored.length > 0) {
      return stored.map(convertStoredMessage);
    }
    
    // Return welcome message if no history
    return [{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date()
    }];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to localStorage when they change
  useEffect(() => {
    // Skip saving if it's just the initial welcome message
    if (messages.length > 1 || (messages.length === 1 && messages[0].id !== '1')) {
      const storableMessages = messages.map(convertToStoredMessage);
      saveChatHistory(storableMessages);
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Möchten Sie den Chat-Verlauf wirklich löschen?')) {
      clearChatHistory();
      setMessages([{
        id: '1',
        type: 'bot',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userQuestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Call API
      const response: AnswerResponse = await ask(userQuestion);
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date(response.timestamp),
        confidence: response.confidence,
        sourceId: response.sourceId
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Entschuldigung, ich konnte Ihre Frage nicht beantworten. Bitte versuchen Sie es erneut.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.type !== 'bot') return;

    // Find the user question that preceded this bot message
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const userMessage = messages[messageIndex - 1];
    
    if (!userMessage || userMessage.type !== 'user') return;

    try {
      const feedbackData: FeedbackRequest = {
        question: userMessage.content,
        helpful,
        sourceId: message.sourceId
      };

      await sendFeedback(feedbackData);

      // Update message with feedback
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback: helpful } : m
      ));
    } catch (err) {
      console.error('Feedback error:', err);
      // Could show a toast or temporary error message here
    }
  };

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return '';
    return `Vertrauen: ${Math.round(confidence * 100)}%`;
  };

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Bot message metadata */}
              {message.type === 'bot' && (
                <div className="mt-2 space-y-2">
                  {/* Source citation */}
                  {message.sourceId && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      📚 Quelle: FAQ #{message.sourceId}
                    </div>
                  )}
                  
                  {/* Confidence score */}
                  {message.confidence && (
                    <div className="text-xs text-gray-500">
                      {formatConfidence(message.confidence)}
                    </div>
                  )}
                  
                  {/* Feedback buttons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">War das hilfreich?</span>
                    <button
                      onClick={() => handleFeedback(message.id, true)}
                      className={`text-xs px-2 py-1 rounded ${
                        message.feedback === true
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 hover:bg-green-100 text-gray-600'
                      }`}
                      disabled={message.feedback !== undefined}
                    >
                      👍 Ja
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, false)}
                      className={`text-xs px-2 py-1 rounded ${
                        message.feedback === false
                          ? 'text-white'
                          : 'bg-gray-200 hover:text-white text-gray-600'
                      }`}
                      style={{
                        backgroundColor: message.feedback === false 
                          ? 'rgb(185, 28, 28)' 
                          : message.feedback === undefined 
                            ? undefined 
                            : 'rgb(185, 28, 28)',
                        opacity: message.feedback === false ? 1 : message.feedback === undefined ? 0.7 : 1
                      }}
                      disabled={message.feedback !== undefined}
                    >
                      👎 Nein
                    </button>
                  </div>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse text-gray-500">●●●</div>
                <span className="text-sm text-gray-500">Antwort wird generiert...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 border-t" style={{ backgroundColor: 'rgba(185, 28, 28, 0.1)', borderColor: 'rgba(185, 28, 28, 0.3)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgb(185, 28, 28)' }}>Fehler: {error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleClearHistory}
            disabled={loading}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Chat-Verlauf löschen"
          >
            🗑️
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Senden...' : 'Senden'}
          </button>
        </div>
        
        {/* Session Info */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Session: {getCurrentSessionId()?.slice(-8) || 'N/A'} | {messages.length - 1} Nachrichten
        </div>
      </div>
    </div>
  );
}
