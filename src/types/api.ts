// API Request/Response Types
export interface AnswerRequest {
  question: string;
  sessionId?: string;
}

export interface AnswerResponse {
  answer: string;
  confidence: number;
  sourceId?: string;
}

export interface FeedbackRequest {
  question: string;
  helpful: boolean;
  sourceId?: string;
}

export interface FeedbackResponse {
  ok: true;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  confidence?: number;
  sourceId?: string;
  feedback?: boolean;
}

// API Error Type
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Memory Types
export interface MemoryItem {
  id: string;
  userId: string;
  type: 'preference' | 'profile_fact' | 'contact' | 'task_hint';
  key: string;
  value: string;
  confidence: number;
  createdAt: string;
  expiresAt?: string;
}

export interface MemoryConfirmRequest {
  suggestionIds: string[];
}

export interface MemoryRejectRequest {
  suggestionIds: string[];
}

export interface MemoryConfirmResponse {
  confirmed: MemoryItem[];
  message: string;
}

export interface MemoryRejectResponse {
  rejected: string[];
  message: string;
}
