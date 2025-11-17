/**
 * Task: Send x-session-id header with all requests.
 * - Read from localStorage "sid"; if absent, generate UUIDv4 and store.
 * - Include header in POST /api/answer and SSE /api/answer/stream
 */

import { API_BASE } from './config';

const BASE_URL = API_BASE;

/**
 * Generate a UUIDv4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create session ID from localStorage
 * If user is logged in, use their user ID as session ID
 * Otherwise, generate a random session ID
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'sid';
  
  try {
    // First, check if we have a logged-in user info
    const userInfoStr = localStorage.getItem('user');
    console.log('🔍 Checking localStorage for user:', userInfoStr ? 'Found' : 'Not found');
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log('🔍 Parsed user info:', userInfo);
        
        if (userInfo && userInfo.id) {
          console.log('🆔 Using user ID as session ID:', userInfo.id);
          return userInfo.id;
        } else {
          console.warn('⚠️ User info found but no ID field');
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse user info from localStorage', e);
      }
    }
    
    // Fallback to session-based ID
    let sessionId = localStorage.getItem(STORAGE_KEY);
    
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem(STORAGE_KEY, sessionId);
      console.log('🆔 Generated new anonymous session ID:', sessionId);
    } else {
      console.log('🆔 Using existing anonymous session ID:', sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // Fallback if localStorage is not available (e.g., incognito mode)
    console.warn('⚠️ localStorage not available, using temporary session ID');
    return generateUUID();
  }
}

/**
 * Clear current session ID (useful for logout or new session)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem('sid');
    localStorage.removeItem('chat_history');
    console.log('🗑️ Session ID and chat history cleared');
  } catch (error) {
    console.warn('⚠️ Could not clear session data from localStorage');
  }
}

/**
 * Interface for stored chat messages
 */
export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string; // ISO string
  confidence?: number;
  sourceId?: string;
  feedback?: boolean;
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    const sessionId = getSessionId();
    const historyKey = `chat_history_${sessionId}`;
    localStorage.setItem(historyKey, JSON.stringify(messages));
    console.log(`💾 Chat history saved (${messages.length} messages)`);
  } catch (error) {
    console.warn('⚠️ Could not save chat history to localStorage');
  }
}

/**
 * Load chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const sessionId = getSessionId();
    const historyKey = `chat_history_${sessionId}`;
    const stored = localStorage.getItem(historyKey);
    
    if (stored) {
      const messages = JSON.parse(stored) as ChatMessage[];
      console.log(`📖 Chat history loaded (${messages.length} messages)`);
      return messages;
    }
  } catch (error) {
    console.warn('⚠️ Could not load chat history from localStorage');
  }
  
  return [];
}

/**
 * Clear chat history for current session
 */
export function clearChatHistory(): void {
  try {
    const sessionId = getSessionId();
    const historyKey = `chat_history_${sessionId}`;
    localStorage.removeItem(historyKey);
    console.log('🗑️ Chat history cleared');
  } catch (error) {
    console.warn('⚠️ Could not clear chat history from localStorage');
  }
}

/**
 * Get current session ID (without generating new one)
 */
export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem('sid');
  } catch (error) {
    return null;
  }
}

/**
 * Get common headers including session ID
 */
function getCommonHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
}

export interface AnswerResponse {
  answer: string;
  confidence: number;
  sourceId?: string;
  timestamp: string;
}

export interface FeedbackRequest {
  question: string;
  helpful: boolean;
  sourceId?: string;
}

export interface FeedbackResponse {
  ok: boolean;
}

/**
 * Ask a question to the chatbot API
 */
export async function ask(question: string): Promise<AnswerResponse> {
  const response = await fetch(`${BASE_URL}/api/answer`, {
    method: 'POST',
    credentials: 'include',
    headers: getCommonHeaders(),
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send feedback for an answer
 */
export async function sendFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
  const response = await fetch(`${BASE_URL}/api/feedback`, {
    method: 'POST',
    credentials: 'include',
    headers: getCommonHeaders(),
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Streaming result interface for askStream
 */
export interface StreamResult {
  done: Promise<void>;
  cancel: () => void;
}

/**
 * Check if EventSource is available and not blocked
 */
function isEventSourceAvailable(): boolean {
  return typeof EventSource !== 'undefined' && EventSource !== null;
}

/**
 * Check if SSE is likely to work (more comprehensive check)
 * @returns Object with availability status and reason
 */
export function checkSSESupport(): { available: boolean; reason: string; mode: 'sse' | 'fallback' } {
  if (!isEventSourceAvailable()) {
    return {
      available: false,
      reason: 'EventSource API not supported by this browser',
      mode: 'fallback'
    };
  }
  
  // Check if we're in a secure context (HTTPS) or localhost
  const isSecureContext = window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
  
  if (!isSecureContext && BASE_URL.startsWith('https:')) {
    return {
      available: false,
      reason: 'Mixed content: HTTPS API from HTTP page may block SSE',
      mode: 'fallback'
    };
  }
  
  return {
    available: true,
    reason: 'SSE should work normally',
    mode: 'sse'
  };
}

/**
 * Fallback function: Use regular POST /api/answer when SSE is not available
 * @param question The question to ask
 * @param onChunk Callback function for each character/chunk
 * @returns Object with done promise and cancel function
 */
function askStreamFallback(question: string, onChunk: (text: string) => void): StreamResult {
  let isCancelled = false;
  
  const done = new Promise<void>(async (resolve, reject) => {
    try {
      if (isCancelled) {
        reject(new Error('Request was cancelled'));
        return;
      }
      
      console.log('Using fallback mode: POST /api/answer (SSE not available)');
      
      // Call regular API endpoint
      const response = await ask(question);
      
      if (isCancelled) {
        reject(new Error('Request was cancelled'));
        return;
      }
      
      // Simulate streaming by sending the full answer character by character
      const fullAnswer = response.answer;
      
      for (let i = 0; i < fullAnswer.length; i++) {
        if (isCancelled) {
          reject(new Error('Request was cancelled'));
          return;
        }
        
        // Send character to callback
        onChunk(fullAnswer[i]);
        
        // Small delay to simulate streaming (optional, can be removed for immediate display)
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      if (!isCancelled) {
        resolve();
      }
    } catch (error) {
      if (!isCancelled) {
        reject(error instanceof Error ? error : new Error('Fallback request failed'));
      }
    }
  });
  
  const cancel = () => {
    isCancelled = true;
    console.log('Fallback streaming cancelled by user');
  };
  
  return {
    done,
    cancel
  };
}

/**
 * Ask a question using Server-Sent Events (SSE) streaming with automatic fallback
 * @param question The question to ask
 * @param onChunk Callback function for each data chunk received
 * @returns Object with done promise and cancel function
 * 
 * Task: Add fallback: if EventSource not available or blocked by CORS,
 * call POST /api/answer and append full answer at once.
 */
export function askStream(question: string, onChunk: (text: string) => void): StreamResult {
  // Check if EventSource is available
  if (!isEventSourceAvailable()) {
    console.warn('EventSource not available, using fallback mode');
    return askStreamFallback(question, onChunk);
  }
  
  // Build URL with encoded question parameter and session ID
  const sessionId = getSessionId();
  const url = `${BASE_URL}/api/answer/stream?question=${encodeURIComponent(question)}&sessionId=${encodeURIComponent(sessionId)}`;
  
  // Note: EventSource automatically includes cookies (withCredentials: true behavior)
  // when connecting to the same origin or when proper CORS headers are set by the server.
  // The backend must set Access-Control-Allow-Credentials: true for cross-origin requests.
  
  let eventSource: EventSource | null = null;
  let isCompleted = false;
  let hasFallenBack = false;
  
  // Create the promise that resolves when streaming is done
  const done = new Promise<void>((resolve, reject) => {
    const attemptFallback = (reason: string) => {
      if (hasFallenBack || isCompleted) return;
      
      hasFallenBack = true;
      isCompleted = true;
      console.warn(`SSE failed (${reason}), attempting fallback to POST /api/answer`);
      
      // Clean up EventSource
      eventSource?.close();
      
      // Try fallback approach
      const fallbackResult = askStreamFallback(question, onChunk);
      fallbackResult.done
        .then(() => resolve())
        .catch((error) => reject(error));
    };
    
    try {
      // Create EventSource for SSE connection
      eventSource = new EventSource(url);
      
      // Set up a timeout to detect if SSE is blocked/slow
      const sseTimeout = setTimeout(() => {
        if (!isCompleted) {
          attemptFallback('connection timeout');
        }
      }, 10000); // 10 second timeout
      
      // Handle incoming messages
      eventSource.onmessage = (event) => {
        clearTimeout(sseTimeout);
        
        const data = event.data;
        
        if (data === '[DONE]') {
          // Stream completed successfully
          isCompleted = true;
          eventSource?.close();
          resolve();
        } else if (data === '[ERROR]') {
          // Stream ended with error - try fallback
          attemptFallback('server error');
        } else {
          // Regular data chunk - call the callback
          onChunk(data);
        }
      };
      
      // Handle connection errors - attempt fallback
      eventSource.onerror = () => {
        clearTimeout(sseTimeout);
        if (!isCompleted && !hasFallenBack) {
          // Check if it's a CORS error or network issue
          attemptFallback('network/CORS error');
        }
      };
      
      // Handle connection opened
      eventSource.onopen = () => {
        clearTimeout(sseTimeout);
        console.log('SSE connection opened for streaming');
      };
      
    } catch (error) {
      // Handle EventSource creation errors - attempt fallback
      console.warn('Failed to create EventSource:', error);
      attemptFallback('EventSource creation failed');
    }
  });
  
  // Cancel function to close the EventSource
  const cancel = () => {
    if (eventSource && !isCompleted) {
      isCompleted = true;
      eventSource.close();
      console.log('SSE streaming cancelled by user');
    }
  };
  
  return {
    done,
    cancel
  };
}

/**
 * Confirm memory suggestions
 */
export async function confirmMemory(suggestionIds: string[]): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/memory/confirm`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body: JSON.stringify({ suggestionIds }),
    });

    if (!response.ok) {
      throw new Error(`Memory confirm failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Memory confirm error:', error);
    throw error;
  }
}

/**
 * Reject memory suggestions
 */
export async function rejectMemory(suggestionIds: string[]): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/memory/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
      body: JSON.stringify({ suggestionIds }),
    });

    if (!response.ok) {
      throw new Error(`Memory reject failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Memory reject error:', error);
    throw error;
  }
}

/**
 * Get all memories for the current user
 */
export async function getMemories(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/memory`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch memories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get memories error:', error);
    throw error;
  }
}

/**
 * Delete a specific memory by ID
 */
export async function deleteMemory(memoryId: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/memory/${memoryId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete memory: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete memory error:', error);
    throw error;
  }
}

/**
 * Get memory statistics (KPIs)
 */
export async function getMemoryStats(from?: number, to?: number): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toString());
    if (to) params.append('to', to.toString());
    
    const url = `${BASE_URL}/api/stats/memory${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': getSessionId(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch memory stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get memory stats error:', error);
    throw error;
  }
}

