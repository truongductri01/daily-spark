/**
 * HTTP Client Utility
 * Centralized HTTP client with error handling, retry logic, and request/response interceptors
 */

import { apiConfig, getApiUrl, logApiCall, logApiResponse, logApiError } from '../config';

// HTTP client configuration
interface HttpClientConfig {
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Request options
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

// Response wrapper
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Default configuration
const defaultConfig: HttpClientConfig = {
  timeout: apiConfig.timeout,
  retryAttempts: apiConfig.retryAttempts,
  retryDelay: apiConfig.retryDelay,
};

/**
 * Build URL with query parameters
 */
function buildUrl(baseUrl: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  // Create URL object with a fallback origin for environments where window is not available
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(baseUrl, origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  return url.pathname + url.search;
}

/**
 * Create request headers
 */
function createHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  return {
    ...defaultHeaders,
    ...customHeaders,
  };
}

/**
 * Parse response data
 */
async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
}

/**
 * Create API error from response
 */
async function createApiError(response: Response): Promise<ApiError> {
  const data = await parseResponse(response);
  const message = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
  
  return new ApiError(message, response.status, response.statusText, data);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry logic for failed requests
 */
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  retryAttempts: number,
  retryDelay: number
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except for 429 (rate limit)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Don't retry on server errors (5xx) if this is the last attempt
      if (attempt === retryAttempts) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Make HTTP request with retry logic
 */
export async function makeRequest<T = any>(
  options: RequestOptions,
  config: HttpClientConfig = defaultConfig
): Promise<ApiResponse<T>> {
  const { method, url, data, params, headers } = options;
  
  // Build full URL
  const fullUrl = buildUrl(getApiUrl(url), params);
  const requestHeaders = createHeaders(headers);
  
  // Log request
  logApiCall(method, fullUrl, data);
  
  const requestFn = async (): Promise<ApiResponse<T>> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Log response
      logApiResponse(method, fullUrl, response.status);
      
      if (!response.ok) {
        throw await createApiError(response);
      }
      
      const responseData = await parseResponse(response);
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError || (error as any)?.name === 'AbortError') {
        logApiError(method, fullUrl, error);
        throw new NetworkError(
          (error as any)?.name === 'AbortError' ? 'Request timeout' : 'Network error',
          error as Error
        );
      }
      
      // Handle other errors
      logApiError(method, fullUrl, error);
      throw new NetworkError('Unknown error occurred', error as Error);
    }
  };
  
  // Apply retry logic
  return retryRequest(requestFn, config.retryAttempts, config.retryDelay);
}

/**
 * Convenience methods for different HTTP methods
 */
export const httpClient = {
  get: <T = any>(url: string, params?: Record<string, string>, headers?: Record<string, string>) =>
    makeRequest<T>({ method: 'GET', url, params, headers }),
    
  post: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    makeRequest<T>({ method: 'POST', url, data, headers }),
    
  put: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    makeRequest<T>({ method: 'PUT', url, data, headers }),
    
  delete: <T = any>(url: string, headers?: Record<string, string>) =>
    makeRequest<T>({ method: 'DELETE', url, headers }),
};

export default httpClient;
