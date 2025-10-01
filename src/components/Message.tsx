import React from 'react';
import { ChatMessage } from '../types/api';

interface MessageProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, helpful: boolean) => void;
}

const Message: React.FC<MessageProps> = ({ message, onFeedback }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  };

  const handleFeedback = (helpful: boolean) => {
    if (onFeedback && message.type === 'bot') {
      onFeedback(message.id, helpful);
    }
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-avatar">
        {message.type === 'user' ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        
        {message.type === 'bot' && (
          <>
            {message.confidence !== undefined && (
              <div className="message-meta">
                <span className="timestamp">{formatTime(message.timestamp)}</span>
                <span className={`confidence-badge confidence-${getConfidenceLevel(message.confidence)}`}>
                  {Math.round(message.confidence * 100)}% confidence
                </span>
              </div>
            )}
            
            {message.confidence !== undefined && message.confidence > 0 && (
              <div className="feedback-buttons">
                <button
                  className={`feedback-btn ${message.feedback === true ? 'active helpful' : ''}`}
                  onClick={() => handleFeedback(true)}
                  title="Mark as helpful"
                >
                  👍
                </button>
                <button
                  className={`feedback-btn ${message.feedback === false ? 'active not-helpful' : ''}`}
                  onClick={() => handleFeedback(false)}
                  title="Mark as not helpful"
                >
                  👎
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Message;
