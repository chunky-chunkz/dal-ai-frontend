/**
 * React component example using the askStream API
 * Shows how to integrate streaming responses in a React chat interface
 */

import React, { useState, useCallback, useRef } from 'react';
import { askStream, StreamResult } from '../api/client';
import './StreamingChatExample.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
  timestamp: Date;
}

export const StreamingChatExample: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<StreamResult | null>(null);

  // Add a new message to the chat
  const addMessage = useCallback((text: string, isUser: boolean, isStreaming = false): string => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, {
      id,
      text,
      isUser,
      isStreaming,
      timestamp: new Date()
    }]);
    return id;
  }, []);

  // Update an existing message
  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  // Handle sending a message with streaming response
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isStreaming) return;

    const question = inputText.trim();
    setInputText('');

    // Add user message
    addMessage(question, true);

    // Add bot message placeholder
    const botMessageId = addMessage('', false, true);
    setIsStreaming(true);

    let botResponse = '';

    try {
      // Start streaming
      const stream = askStream(question, (chunk) => {
        botResponse += chunk;
        updateMessage(botMessageId, { 
          text: botResponse,
          isStreaming: true 
        });
      });

      streamRef.current = stream;

      // Wait for completion
      await stream.done;

      // Mark as completed
      updateMessage(botMessageId, { 
        text: botResponse,
        isStreaming: false 
      });

    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error 
        ? `Fehler: ${error.message}` 
        : 'Ein unbekannter Fehler ist aufgetreten.';
      
      updateMessage(botMessageId, { 
        text: errorMessage,
        isStreaming: false 
      });
    } finally {
      setIsStreaming(false);
      streamRef.current = null;
    }
  }, [inputText, isStreaming, addMessage, updateMessage]);

  // Handle canceling the current stream
  const handleCancel = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.cancel();
      setIsStreaming(false);
      streamRef.current = null;
    }
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="streaming-chat">
      <div className="chat-header">
        <h2>Streaming Chat Example</h2>
        <p>Real-time responses using Server-Sent Events</p>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.isUser ? 'user' : 'bot'}`}
          >
            <div className="message-content">
              {message.text}
              {message.isStreaming && (
                <span className="streaming-cursor">█</span>
              )}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stellen Sie Ihre Frage..."
            disabled={isStreaming}
            rows={2}
          />
          <div className="input-buttons">
            {isStreaming ? (
              <button 
                onClick={handleCancel}
                className="cancel-button"
                type="button"
              >
                ⏹️ Abbrechen
              </button>
            ) : (
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="send-button"
                type="button"
              >
                ➤ Senden
              </button>
            )}
          </div>
        </div>
        
        {isStreaming && (
          <div className="streaming-indicator">
            <span className="pulse">●</span>
            Antwort wird gestreamt...
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingChatExample;
