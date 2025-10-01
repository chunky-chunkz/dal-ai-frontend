/**
 * Frontend API client for expert recommendations
 * Provides type-safe interface to the expert recommendation service
 */

// Types matching the backend API
export interface ExpertRecommendationRequest {
  query: string;
  languages?: string[];
  products?: string[];
  region?: string;
  minLoad?: number;
  maxLoad?: number;
  k?: number;
}

export interface ExpertRecommendation {
  id: string;
  name: string;
  role: string;
  email?: string;
  confidence: number;
  reason: string[];
}

export interface ExpertRecommendationResponse {
  candidates: ExpertRecommendation[];
  query: string;
  filters?: {
    languages?: string[];
    products?: string[];
    region?: string;
    loadRange?: {
      min?: number;
      max?: number;
    };
  };
  total: number;
  requestedK: number;
}

export interface ExpertHealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp: string;
  indexAvailable: boolean;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: any;
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const EXPERTS_BASE_PATH = '/api/experts';

/**
 * Fetch expert recommendations based on query and filters
 */
export async function fetchRecommendations(
  query: string,
  opts: Omit<ExpertRecommendationRequest, 'query'> = {}
): Promise<ExpertRecommendationResponse> {
  
  const requestBody: ExpertRecommendationRequest = {
    query,
    ...opts
  };

  // Validate query
  if (!query || query.trim().length === 0) {
    throw new Error('Query is required and cannot be empty');
  }

  // Validate load range
  if (opts.minLoad !== undefined && opts.maxLoad !== undefined && opts.minLoad > opts.maxLoad) {
    throw new Error('minLoad cannot be greater than maxLoad');
  }

  try {
    const response = await fetch(`${API_BASE_URL}${EXPERTS_BASE_PATH}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Handle API errors
      let errorData: ApiError;
      
      try {
        errorData = await response.json();
      } catch {
        // Fallback if JSON parsing fails
        errorData = {
          error: `HTTP ${response.status}`,
          message: response.statusText || 'Request failed'
        };
      }

      const error = new Error(errorData.message || errorData.error || 'Request failed');
      (error as any).status = response.status;
      (error as any).code = errorData.code;
      (error as any).details = errorData.details;
      
      throw error;
    }

    const data: ExpertRecommendationResponse = await response.json();
    
    // Validate response structure
    if (!data.candidates || !Array.isArray(data.candidates)) {
      throw new Error('Invalid response format: missing candidates array');
    }

    return data;

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      throw new Error('Network error: Unable to connect to expert recommendation service');
    }
    
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Check the health of the expert recommendation service
 */
export async function checkExpertServiceHealth(): Promise<ExpertHealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${EXPERTS_BASE_PATH}/recommend/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    const data: ExpertHealthResponse = await response.json();
    return data;

  } catch (error) {
    // Return unhealthy status on any error
    return {
      status: 'unhealthy',
      service: 'expert-recommendation',
      timestamp: new Date().toISOString(),
      indexAvailable: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convenience functions for common search patterns
 */

/**
 * Find experts by programming language
 */
export async function findExpertsByLanguage(
  language: string | string[],
  query: string = 'developer programmer engineer',
  k: number = 10
): Promise<ExpertRecommendation[]> {
  const languages = Array.isArray(language) ? language : [language];
  
  const response = await fetchRecommendations(query, {
    languages,
    k
  });
  
  return response.candidates;
}

/**
 * Find experts by product/project area
 */
export async function findExpertsByProduct(
  product: string | string[],
  query: string = 'expert specialist developer',
  k: number = 10
): Promise<ExpertRecommendation[]> {
  const products = Array.isArray(product) ? product : [product];
  
  const response = await fetchRecommendations(query, {
    products,
    k
  });
  
  return response.candidates;
}

/**
 * Find available experts (low workload)
 */
export async function findAvailableExperts(
  query: string,
  maxLoad: number = 70,
  k: number = 10
): Promise<ExpertRecommendation[]> {
  const response = await fetchRecommendations(query, {
    maxLoad,
    k
  });
  
  return response.candidates;
}

/**
 * Find experts in specific region
 */
export async function findExpertsByRegion(
  region: string,
  query: string = 'expert developer engineer',
  k: number = 10
): Promise<ExpertRecommendation[]> {
  const response = await fetchRecommendations(query, {
    region,
    k
  });
  
  return response.candidates;
}

/**
 * Search for experts with complex criteria
 */
export async function searchExperts(options: {
  query: string;
  languages?: string[];
  products?: string[];
  region?: string;
  availability?: 'high' | 'medium' | 'low' | 'any';
  limit?: number;
}): Promise<ExpertRecommendation[]> {
  const { query, languages, products, region, availability = 'any', limit = 10 } = options;
  
  // Map availability to load constraints
  let maxLoad: number | undefined;
  switch (availability) {
    case 'high':
      maxLoad = 50; // Less than 50% loaded = highly available
      break;
    case 'medium':
      maxLoad = 75; // Less than 75% loaded = moderately available
      break;
    case 'low':
      maxLoad = 90; // Less than 90% loaded = low availability
      break;
    case 'any':
    default:
      maxLoad = undefined; // No constraint
      break;
  }
  
  const response = await fetchRecommendations(query, {
    languages,
    products,
    region,
    maxLoad,
    k: limit
  });
  
  return response.candidates;
}

/**
 * Format confidence score as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

/**
 * Get the primary reason for an expert match
 */
export function getPrimaryReason(expert: ExpertRecommendation): string {
  return expert.reason.length > 0 ? expert.reason[0] : 'General expertise match';
}

/**
 * Check if an expert has high confidence
 */
export function hasHighConfidence(expert: ExpertRecommendation, threshold: number = 0.8): boolean {
  return expert.confidence >= threshold;
}

/**
 * Group experts by confidence level
 */
export function groupExpertsByConfidence(experts: ExpertRecommendation[]): {
  high: ExpertRecommendation[];
  medium: ExpertRecommendation[];
  low: ExpertRecommendation[];
} {
  return experts.reduce(
    (groups, expert) => {
      if (expert.confidence >= 0.8) {
        groups.high.push(expert);
      } else if (expert.confidence >= 0.6) {
        groups.medium.push(expert);
      } else {
        groups.low.push(expert);
      }
      return groups;
    },
    { high: [], medium: [], low: [] } as {
      high: ExpertRecommendation[];
      medium: ExpertRecommendation[];
      low: ExpertRecommendation[];
    }
  );
}
