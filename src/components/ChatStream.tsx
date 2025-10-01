import React, { useState, useRef, useEffect } from 'react';
import { askStream } from '../api/client';
import { useAutoScroll } from '../hooks/useAutoScroll';
import './ChatStream.css';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatStreamProps {
  className?: string;
  placeholder?: string;
  maxHeight?: string;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  className = '',
  placeholder = 'Frage eingeben...',
  maxHeight = '600px'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<{ cancel: () => void } | null>(null);

  // Auto-scroll hook for messages container
  const { ref: messagesContainerRef, scrollToBottom } = useAutoScroll(
    [messages, isTyping], // Dependencies that trigger auto-scroll
    'smooth', // Scroll behavior
    true // Always enabled
  );

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setLoading(true);
    setIsTyping(false);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: question }]);

    // Add empty bot message that will be filled with streaming content
    setMessages(prev => [...prev, { role: 'bot', text: '' }]);

    try {
      setIsTyping(true);
      
      // Start streaming
      const stream = askStream(question, (chunk: string) => {
        // Append chunk to the last bot message
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'bot') {
            lastMessage.text += chunk;
          }
          return newMessages;
        });
      });

      // Store stream reference for potential cancellation
      streamRef.current = stream;

      // Wait for streaming to complete
      await stream.done;
      
      setIsTyping(false);
      
    } catch (error) {
      setIsTyping(false);
      
      // Update the last bot message with error
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'bot') {
          lastMessage.text = `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
        }
        return newMessages;
      });
      
      console.error('Streaming error:', error);
    } finally {
      setLoading(false);
      streamRef.current = null;
      
      // Ensure we scroll to bottom after completion
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
      
      // Refocus input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleCancel = () => {
    if (streamRef.current) {
      streamRef.current.cancel();
      setIsTyping(false);
      setLoading(false);
      streamRef.current = null;
      
      // Update the last bot message to indicate cancellation
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'bot' && !lastMessage.text) {
          lastMessage.text = 'Antwort abgebrochen.';
        }
        return newMessages;
      });
    }
  };

  const clearChat = () => {
    if (!loading) {
      setMessages([]);
      setInput('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`chat-stream ${className}`}>
      {/* Header */}
      <div className="chat-header">
        <h3>FAQ Chat</h3>
        <button
          onClick={clearChat}
          disabled={loading}
          className="clear-button"
          title="Chat löschen"
        >
          🗑️
        </button>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="messages-container"
        style={{ maxHeight }}
      >
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>👋 Hallo! Ich kann Ihnen bei Fragen zu unseren Services helfen.</p>
            <p>Stellen Sie einfach eine Frage:</p>
            <div className="example-questions">
              <button 
                onClick={() => setInput('Wie kann ich meine Rechnung bezahlen?')}
                disabled={loading}
                className="example-button"
              >
                "Wie kann ich meine Rechnung bezahlen?"
              </button>
              <button 
                onClick={() => setInput('Wie kann ich mein Passwort zurücksetzen?')}
                disabled={loading}
                className="example-button"
              >
                "Wie kann ich mein Passwort zurücksetzen?"
              </button>
              <button 
                onClick={() => setInput('Welche Zahlungsmethoden akzeptieren Sie?')}
                disabled={loading}
                className="example-button"
              >
                "Welche Zahlungsmethoden akzeptieren Sie?"
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {message.text || (message.role === 'bot' && isTyping && index === messages.length - 1 ? '' : 'Keine Antwort')}
                  </div>
                  {message.role === 'bot' && isTyping && index === messages.length - 1 && (
                    <div className="typing-indicator">
                      <span className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                      tippt...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area">
        {loading && (
          <div className="status-bar">
            <span className="status-text">
              {isTyping ? '🤖 Bot tippt...' : '⏳ Verarbeitung...'}
            </span>
            <button
              onClick={handleCancel}
              className="cancel-button"
              title="Antwort abbrechen"
            >
              Abbrechen
            </button>
          </div>
        )}
        
        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={loading ? 'Bitte warten...' : placeholder}
            disabled={loading}
            className="chat-input"
            maxLength={500}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            className="send-button"
            title={loading ? 'Bitte warten...' : 'Nachricht senden (Enter)'}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
        
        <div className="input-hint">
          Drücken Sie Enter zum Senden • {input.length}/500 Zeichen
        </div>
      </div>
    </div>
  );
};

export default ChatStream;
