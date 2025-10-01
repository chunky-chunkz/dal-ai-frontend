import { useState, useCallback } from 'react';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { ChatMessage } from './types/api';
import apiClient from './services/api';

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await apiClient.ask({ question: content });

      // Add bot response
      const botMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'bot',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        sourceId: response.sourceId,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error getting response:', err);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
        confidence: 0,
      };

      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to get response from the chatbot. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFeedback = useCallback(async (messageId: string, helpful: boolean) => {
    try {
      // Find the message to get the original question and sourceId
      const message = messages.find(m => m.id === messageId);
      const userMessage = messages.find(m => m.type === 'user' && messages.indexOf(m) === messages.indexOf(message!) - 1);

      if (message && userMessage) {
        // Update the message with feedback
        setMessages(prev => 
          prev.map(m => 
            m.id === messageId 
              ? { ...m, feedback: helpful }
              : m
          )
        );

        // Submit feedback to API
        await apiClient.submitFeedback({
          question: userMessage.content,
          helpful,
          sourceId: message.sourceId,
        });
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Revert the feedback state on error
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, feedback: undefined }
            : m
        )
      );
    }
  }, [messages]);

  return (
    <div className="app">
      <div className="header">
        <h1>Chatbot Assistant</h1>
        <p>Ask me about our services, policies, and products</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      <MessageList 
        messages={messages}
        isLoading={isLoading}
        onFeedback={handleFeedback}
      />

      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}

export default App;
