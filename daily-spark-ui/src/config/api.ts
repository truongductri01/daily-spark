/**
 * API Configuration for Azure Functions
 * Centralized configuration for API endpoints, timeouts, and retry logic
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000'),
    enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true' || isDevelopment
  };
};

export const apiConfig = getApiConfig();

// Helper function to get full URL for an endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}${endpoint}`;
};

// Helper function to log API calls (only in development or when enabled)
export const logApiCall = (method: string, url: string, data?: any): void => {
  if (apiConfig.enableLogging) {
    console.log(`[API] ${method} ${url}`, data ? { data } : '');
  }
};

// Helper function to log API responses
export const logApiResponse = (method: string, url: string, status: number, data?: any): void => {
  if (apiConfig.enableLogging) {
    console.log(`[API] ${method} ${url} - ${status}`, data ? { data } : '');
  }
};

// Helper function to log API errors
export const logApiError = (method: string, url: string, error: any): void => {
  if (apiConfig.enableLogging) {
    console.error(`[API] ${method} ${url} - Error:`, error);
  }
};
