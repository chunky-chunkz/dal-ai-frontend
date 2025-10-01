import axios, { AxiosInstance } from 'axios';
import {
  AnswerRequest,
  AnswerResponse,
  FeedbackRequest,
  FeedbackResponse,
  HealthResponse
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check API health
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health');
    return response.data;
  }

  /**
   * Ask a question to the chatbot
   */
  async ask(request: AnswerRequest): Promise<AnswerResponse> {
    const response = await this.client.post<AnswerResponse>('/api/answer', request);
    return response.data;
  }

  /**
   * Submit feedback for an answer
   */
  async submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    const response = await this.client.post<FeedbackResponse>('/api/feedback', request);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
