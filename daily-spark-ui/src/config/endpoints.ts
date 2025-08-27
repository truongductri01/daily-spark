/**
 * API Endpoints Configuration
 * Type-safe endpoint definitions for Azure Functions
 * 
 * These endpoints are relative paths that will be combined with the base URL
 * from the API configuration (e.g., http://localhost:7071/api)
 */

export const ENDPOINTS = {
  // User Management Endpoints
  CREATE_USER: '/CreateUser',
  GET_USER: '/GetUser',
  UPDATE_USER: '/UpdateUser',
  GET_USER_COUNT: '/GetUserCount',
  
  // Curriculum Management Endpoints
  CREATE_CURRICULUM: '/CreateCurriculum',
  GET_CURRICULUM: '/GetCurriculum',
  GET_CURRICULA_BY_USER: '/GetCurriculaByUserId',
  UPDATE_CURRICULUM: '/UpdateCurriculum',
  DELETE_CURRICULUM: '/DeleteCurriculum',
  
  // Additional Endpoints
  QUERY_CURRICULUM_TOPICS: '/QueryCurriculumTopicsByUserId',
  START_PROCESS_ALL_USERS: '/StartProcessAllUsers'
} as const;

// Type for endpoint names
export type EndpointName = keyof typeof ENDPOINTS;

// Helper function to get endpoint URL
export const getEndpoint = (name: EndpointName): string => {
  return ENDPOINTS[name];
};

// Helper function to get full URL for an endpoint (combines base URL + endpoint)
export const getFullEndpointUrl = (name: EndpointName): string => {
  // Import apiConfig dynamically to avoid circular dependencies
  const apiConfig = require('./api').apiConfig;
  return `${apiConfig.baseUrl}${ENDPOINTS[name]}`;
};

// HTTP Methods for each endpoint
export const ENDPOINT_METHODS: Record<EndpointName, 'GET' | 'POST' | 'PUT' | 'DELETE'> = {
  // User endpoints
  CREATE_USER: 'POST',
  GET_USER: 'GET',
  UPDATE_USER: 'PUT',
  GET_USER_COUNT: 'GET',
  
  // Curriculum endpoints
  CREATE_CURRICULUM: 'POST',
  GET_CURRICULUM: 'GET',
  GET_CURRICULA_BY_USER: 'GET',
  UPDATE_CURRICULUM: 'PUT',
  DELETE_CURRICULUM: 'DELETE',
  
  // Additional endpoints
  QUERY_CURRICULUM_TOPICS: 'GET',
  START_PROCESS_ALL_USERS: 'POST'
} as const;

// Helper function to get HTTP method for an endpoint
export const getEndpointMethod = (name: EndpointName): 'GET' | 'POST' | 'PUT' | 'DELETE' => {
  return ENDPOINT_METHODS[name];
};

// Query parameter requirements for GET endpoints
export const ENDPOINT_QUERY_PARAMS: Record<EndpointName, string[]> = {
  // User endpoints
  CREATE_USER: [],
  GET_USER: ['userId'],
  UPDATE_USER: [],
  GET_USER_COUNT: [],
  
  // Curriculum endpoints
  CREATE_CURRICULUM: [],
  GET_CURRICULUM: ['curriculumId', 'userId'],
  GET_CURRICULA_BY_USER: ['userId'],
  UPDATE_CURRICULUM: [],
  DELETE_CURRICULUM: ['curriculumId', 'userId'],
  
  // Additional endpoints
  QUERY_CURRICULUM_TOPICS: ['userId'],
  START_PROCESS_ALL_USERS: []
};

// Helper function to get required query parameters for an endpoint
export const getEndpointQueryParams = (name: EndpointName): string[] => {
  return ENDPOINT_QUERY_PARAMS[name];
};
