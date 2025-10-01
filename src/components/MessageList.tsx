import React from 'react';
import { ChatMessage } from '../types/api';
import Message from './Message';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onFeedback?: (messageId: string, helpful: boolean) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onFeedback }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <h3>Welcome to the Chatbot!</h3>
        <p>Ask me anything about our services, policies, or products.</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onFeedback={onFeedback}
        />
      ))}
      
      {isLoading && (
        <div className="loading-indicator">
          <div className="message-avatar">🤖</div>
          <div>
            <span>Typing</span>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
