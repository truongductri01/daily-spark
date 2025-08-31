/**
 * Configuration utilities for environment variables
 */

export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api',
  
  // User Limits
  MAX_USERS_LIMIT: parseInt(process.env.REACT_APP_MAX_USERS_LIMIT || '100', 10),
  DEMO_USER_ID: process.env.REACT_APP_DEMO_USER_ID || 'first-user',
  
  // Curriculum Limits
  MAX_CURRICULA_PER_USER: parseInt(process.env.REACT_APP_MAX_CURRICULA_PER_USER || '5', 10),
} as const;

/**
 * Check if current user is demo user
 */
export const isDemoUser = (userId: string): boolean => {
  return userId === config.DEMO_USER_ID;
};

/**
 * Get remaining user slots
 */
export const getRemainingSlots = (currentCount: number): number => {
  return Math.max(0, config.MAX_USERS_LIMIT - currentCount);
};

/**
 * Check if user limit is reached
 */
export const isUserLimitReached = (currentCount: number): boolean => {
  return currentCount >= config.MAX_USERS_LIMIT;
};

/**
 * Get remaining curriculum slots
 */
export const getRemainingCurriculumSlots = (currentCount: number): number => {
  return Math.max(0, config.MAX_CURRICULA_PER_USER - currentCount);
};

/**
 * Check if curriculum limit is reached
 */
export const isCurriculumLimitReached = (currentCount: number): boolean => {
  return currentCount >= config.MAX_CURRICULA_PER_USER;
};
