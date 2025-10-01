/**
 * useAutoScroll Hook - Usage Examples
 * 
 * This file demonstrates various ways to use the useAutoScroll hook
 * in different scenarios and components.
 */

import React, { useState } from 'react';
import { useAutoScroll } from './useAutoScroll';

// Example 1: Basic usage in a simple chat component
export const SimpleChatExample: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  // Basic auto-scroll that triggers when messages change
  const { ref } = useAutoScroll([messages]);

  const addMessage = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, input.trim()]);
      setInput('');
    }
  };

  return (
    <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div 
        ref={ref}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          padding: '10px' 
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {msg}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addMessage()}
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={addMessage}>Send</button>
      </div>
    </div>
  );
};

// Example 2: Advanced usage with manual control
export const AdvancedChatExample: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Auto-scroll with multiple dependencies and manual control
  const { ref, scrollToBottom, isAtBottom } = useAutoScroll(
    [messages, isStreaming], // Auto-scroll when messages or streaming state changes
    'smooth', // Smooth scrolling
    true // Always enabled
  );

  const simulateStreaming = () => {
    setIsStreaming(true);
    setMessages(prev => [...prev, 'Bot is typing...']);
    
    // Simulate streaming chunks
    setTimeout(() => {
      setMessages(prev => [...prev.slice(0, -1), 'Bot response: Hello!']);
      setIsStreaming(false);
    }, 1000);
  };

  const jumpToBottom = () => {
    scrollToBottom('auto'); // Instant scroll
  };

  return (
    <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={simulateStreaming} disabled={isStreaming}>
          Simulate Streaming
        </button>
        <button onClick={jumpToBottom} style={{ marginLeft: '10px' }}>
          Jump to Bottom
        </button>
        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
          At bottom: {isAtBottom() ? 'Yes' : 'No'}
        </span>
      </div>
      
      <div 
        ref={ref}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          padding: '10px',
          backgroundColor: '#f9f9f9'
        }}
      >
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px',
              padding: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              opacity: isStreaming && index === messages.length - 1 ? 0.7 : 1
            }}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 3: Log viewer with conditional auto-scroll
export const LogViewerExample: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(['Starting application...']);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Conditional auto-scroll based on user preference
  const { ref, scrollToBottom, isAtBottom } = useAutoScroll(
    [logs], 
    'smooth', 
    autoScrollEnabled // User can toggle auto-scroll
  );

  // Add new log entries
  const addLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] Log entry ${prev.length + 1}`]);
  };

  // Auto-add logs periodically (simulation)
  React.useEffect(() => {
    const interval = setInterval(addLog, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          <input 
            type="checkbox"
            checked={autoScrollEnabled}
            onChange={(e) => setAutoScrollEnabled(e.target.checked)}
          />
          Auto-scroll
        </label>
        <button onClick={addLog}>Add Log</button>
        <button onClick={() => scrollToBottom('auto')}>Scroll to Bottom</button>
        <span style={{ fontSize: '12px', color: '#666' }}>
          At bottom: {isAtBottom() ? 'Yes' : 'No'} | Total: {logs.length} logs
        </span>
      </div>
      
      <div 
        ref={ref}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          border: '1px solid #333', 
          padding: '10px',
          backgroundColor: '#000',
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}
      >
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 4: Custom hook usage patterns
export const HookUsagePatterns = {
  
  // Basic pattern
  basic: () => {
    const [items, setItems] = useState([]);
    const { ref } = useAutoScroll([items]);
    return { ref, items, setItems };
  },

  // With streaming support
  withStreaming: () => {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const { ref, scrollToBottom } = useAutoScroll([messages, isStreaming], 'smooth');
    return { ref, messages, setMessages, isStreaming, setIsStreaming, scrollToBottom };
  },

  // With user control
  withUserControl: () => {
    const [items, setItems] = useState([]);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const autoScroll = useAutoScroll([items], 'smooth', autoScrollEnabled);
    return { ...autoScroll, items, setItems, autoScrollEnabled, setAutoScrollEnabled };
  },

  // Performance optimized
  performanceOptimized: () => {
    const [items, setItems] = useState([]);
    // Only auto-scroll when items change, with instant scrolling for performance
    const { ref } = useAutoScroll([items], 'auto');
    return { ref, items, setItems };
  },

  // Multi-dependency
  multiDependency: () => {
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    // Auto-scroll when any of these change
    const { ref } = useAutoScroll([messages, typing, loading]);
    return { ref, messages, setMessages, typing, setTyping, loading, setLoading };
  }
};

export default {
  SimpleChatExample,
  AdvancedChatExample,
  LogViewerExample,
  HookUsagePatterns
};
