/**
 * Real API Service
 * Replaces mock API with actual Azure Functions calls
 */

import { httpClient, ApiError as HttpClientApiError, NetworkError } from './httpClient';
import { ENDPOINTS } from '../config';
import {
  User,
  Curriculum,
  CreateUserRequest,
  UpdateUserRequest,
  CreateCurriculumRequest,
  UpdateCurriculumRequest,
  ApiResponse,
  ApiError
} from '../types';

/**
 * Convert HTTP client error to API error
 */
function convertError(error: Error): ApiError {
  if (error instanceof HttpClientApiError) {
    return {
      message: error.message,
      statusCode: error.status,
      details: error.data
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      statusCode: 0,
      details: error.originalError
    };
  }
  
  return {
    message: error.message || 'Unknown error occurred',
    statusCode: 0,
    details: error
  };
}

/**
 * Create success response wrapper
 */
function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    data,
    success: true,
    message
  };
}

/**
 * Create error response wrapper
 */
function createErrorResponse<T>(error: ApiError): ApiResponse<T> {
  return {
    data: null as T,
    success: false,
    message: error.message
  };
}

/**
 * Real API Service Class
 */
export class ApiService {
  /**
   * User Management
   */
  
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.post<User>(ENDPOINTS.CREATE_USER, userData);
      return createSuccessResponse(response.data, 'User created successfully');
    } catch (error) {
      return createErrorResponse<User>(convertError(error as Error));
    }
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.get<User>(ENDPOINTS.GET_USER, { userId });
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse<User>(convertError(error as Error));
    }
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.put<User>(ENDPOINTS.UPDATE_USER, userData);
      return createSuccessResponse(response.data, 'User updated successfully');
    } catch (error) {
      return createErrorResponse<User>(convertError(error as Error));
    }
  }

  async getUserCount(): Promise<ApiResponse<{ totalUsers: number }>> {
    try {
      const response = await httpClient.get<{ totalUsers: number }>(ENDPOINTS.GET_USER_COUNT);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse<{ totalUsers: number }>(convertError(error as Error));
    }
  }

  /**
   * Curriculum Management
   */
  
  async createCurriculum(curriculumData: CreateCurriculumRequest): Promise<ApiResponse<Curriculum>> {
    try {
      const response = await httpClient.post<Curriculum>(ENDPOINTS.CREATE_CURRICULUM, curriculumData);
      return createSuccessResponse(response.data, 'Curriculum created successfully');
    } catch (error) {
      return createErrorResponse<Curriculum>(convertError(error as Error));
    }
  }

  async getCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<Curriculum>> {
    try {
      const response = await httpClient.get<Curriculum>(ENDPOINTS.GET_CURRICULUM, { 
        curriculumId, 
        userId 
      });
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse<Curriculum>(convertError(error as Error));
    }
  }

  async getCurriculaByUserId(userId: string): Promise<ApiResponse<Curriculum[]>> {
    try {
      const response = await httpClient.get<Curriculum[]>(ENDPOINTS.GET_CURRICULA_BY_USER, { userId });
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse<Curriculum[]>(convertError(error as Error));
    }
  }

  async updateCurriculum(curriculumId: string, curriculumData: UpdateCurriculumRequest): Promise<ApiResponse<Curriculum>> {
    try {
      const response = await httpClient.put<Curriculum>(ENDPOINTS.UPDATE_CURRICULUM, curriculumData);
      return createSuccessResponse(response.data, 'Curriculum updated successfully');
    } catch (error) {
      return createErrorResponse<Curriculum>(convertError(error as Error));
    }
  }

  async deleteCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await httpClient.delete<{ success: boolean }>(ENDPOINTS.DELETE_CURRICULUM, {
        curriculumId,
        userId
      });
      return createSuccessResponse(response.data, 'Curriculum deleted successfully');
    } catch (error) {
      return createErrorResponse<{ success: boolean }>(convertError(error as Error));
    }
  }

  /**
   * Additional Endpoints
   */
  
  async queryCurriculumTopicsByUserId(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await httpClient.get<any>(ENDPOINTS.QUERY_CURRICULUM_TOPICS, { userId });
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse<any>(convertError(error as Error));
    }
  }

  async startProcessAllUsers(): Promise<ApiResponse<any>> {
    try {
      const response = await httpClient.post<any>(ENDPOINTS.START_PROCESS_ALL_USERS);
      return createSuccessResponse(response.data, 'Process started successfully');
    } catch (error) {
      return createErrorResponse<any>(convertError(error as Error));
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for backward compatibility
export default apiService;
