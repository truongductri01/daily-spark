/**
 * API Configuration Tests
 * Tests for API configuration and endpoint definitions
 */

import { apiConfig, getApiUrl, logApiCall, logApiResponse, logApiError } from '../api';
import { ENDPOINTS, getEndpoint, getEndpointMethod, getEndpointQueryParams } from '../endpoints';

describe('API Configuration', () => {
  describe('apiConfig', () => {
    it('should have default values when environment variables are not set', () => {
      expect(apiConfig.baseUrl).toBe('http://localhost:7071/api');
      expect(apiConfig.timeout).toBe(10000);
      expect(apiConfig.retryAttempts).toBe(3);
      expect(apiConfig.retryDelay).toBe(1000);
    });

    it('should have enableLogging property', () => {
      expect(typeof apiConfig.enableLogging).toBe('boolean');
    });
  });

  describe('getApiUrl', () => {
    it('should combine base URL with endpoint', () => {
      const url = getApiUrl('/CreateUser');
      expect(url).toBe('http://localhost:7071/api/CreateUser');
    });
  });

  describe('logging functions', () => {
    let consoleSpy: jest.SpyInstance;
    let originalEnableLogging: boolean;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      // Temporarily enable logging for tests
      originalEnableLogging = apiConfig.enableLogging;
      Object.defineProperty(apiConfig, 'enableLogging', {
        value: true,
        writable: true
      });
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      // Restore original logging setting
      Object.defineProperty(apiConfig, 'enableLogging', {
        value: originalEnableLogging,
        writable: true
      });
    });

    it('should log API calls when logging is enabled', () => {
      logApiCall('POST', '/CreateUser', { email: 'test@example.com' });
      expect(consoleSpy).toHaveBeenCalledWith('[API] POST /CreateUser', { data: { email: 'test@example.com' } });
    });

    it('should log API responses when logging is enabled', () => {
      logApiResponse('POST', '/CreateUser', 200, { id: 'user-123' });
      expect(consoleSpy).toHaveBeenCalledWith('[API] POST /CreateUser - 200', { data: { id: 'user-123' } });
    });
  });
});

describe('Endpoints Configuration', () => {
  describe('ENDPOINTS', () => {
    it('should have all required endpoints defined', () => {
      expect(ENDPOINTS.CREATE_USER).toBe('/CreateUser');
      expect(ENDPOINTS.GET_USER).toBe('/GetUser');
      expect(ENDPOINTS.UPDATE_USER).toBe('/UpdateUser');
      expect(ENDPOINTS.CREATE_CURRICULUM).toBe('/CreateCurriculum');
      expect(ENDPOINTS.GET_CURRICULUM).toBe('/GetCurriculum');
      expect(ENDPOINTS.GET_CURRICULA_BY_USER).toBe('/GetCurriculaByUserId');
      expect(ENDPOINTS.UPDATE_CURRICULUM).toBe('/UpdateCurriculum');
      expect(ENDPOINTS.DELETE_CURRICULUM).toBe('/DeleteCurriculum');
    });
  });

  describe('getEndpoint', () => {
    it('should return correct endpoint URL', () => {
      expect(getEndpoint('CREATE_USER')).toBe('/CreateUser');
      expect(getEndpoint('GET_USER')).toBe('/GetUser');
    });
  });

  describe('getEndpointMethod', () => {
    it('should return correct HTTP method for each endpoint', () => {
      expect(getEndpointMethod('CREATE_USER')).toBe('POST');
      expect(getEndpointMethod('GET_USER')).toBe('GET');
      expect(getEndpointMethod('UPDATE_USER')).toBe('PUT');
      expect(getEndpointMethod('DELETE_CURRICULUM')).toBe('DELETE');
    });
  });

  describe('getEndpointQueryParams', () => {
    it('should return correct query parameters for GET endpoints', () => {
      expect(getEndpointQueryParams('GET_USER')).toEqual(['userId']);
      expect(getEndpointQueryParams('GET_CURRICULUM')).toEqual(['curriculumId', 'userId']);
      expect(getEndpointQueryParams('GET_CURRICULA_BY_USER')).toEqual(['userId']);
    });

    it('should return empty array for POST endpoints', () => {
      expect(getEndpointQueryParams('CREATE_USER')).toEqual([]);
      expect(getEndpointQueryParams('CREATE_CURRICULUM')).toEqual([]);
    });
  });
});
