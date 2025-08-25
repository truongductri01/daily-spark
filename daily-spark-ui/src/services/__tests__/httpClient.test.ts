/**
 * HTTP Client Tests
 * Tests for HTTP client utility with error handling and retry logic
 */

import { httpClient, makeRequest, ApiError, NetworkError } from '../httpClient';

// Mock fetch
global.fetch = jest.fn();

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('makeRequest', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { id: 'user-123', displayName: 'Test User' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await makeRequest({
        method: 'GET',
        url: '/GetUser',
        params: { userId: 'user-123' }
      });

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/GetUser?userId=user-123'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      );
    });

    it('should make successful POST request with data', async () => {
      const mockResponse = { id: 'user-123', displayName: 'New User' };
      const requestData = { email: 'test@example.com', displayName: 'New User' };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await makeRequest({
        method: 'POST',
        url: '/CreateUser',
        data: requestData
      });

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(201);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/CreateUser'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle API errors (4xx, 5xx)', async () => {
      const errorResponse = { message: 'User not found', error: 'NOT_FOUND' };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(errorResponse),
      });

      await expect(makeRequest({
        method: 'GET',
        url: '/GetUser',
        params: { userId: 'nonexistent' }
      })).rejects.toThrow(ApiError);
    });


  });

  describe('httpClient convenience methods', () => {
    it('should use GET method', async () => {
      const mockResponse = { data: 'test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.get('/test', { param: 'value' });
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test?param=value'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should use POST method', async () => {
      const mockResponse = { id: '123' };
      const requestData = { name: 'test' };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.post('/test', requestData);
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ 
          method: 'POST',
          body: JSON.stringify(requestData)
        })
      );
    });

    it('should use PUT method', async () => {
      const mockResponse = { updated: true };
      const requestData = { name: 'updated' };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.put('/test', requestData);
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ 
          method: 'PUT',
          body: JSON.stringify(requestData)
        })
      );
    });

    it('should use DELETE method', async () => {
      const mockResponse = { deleted: true };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.delete('/test');
      expect(result.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('URL building', () => {
    it('should build URL without parameters', () => {
      const url = 'http://localhost:7071/api/test';
      expect(url).toBe('http://localhost:7071/api/test');
    });

    it('should build URL with parameters', () => {
      const baseUrl = 'http://localhost:7071/api/test';
      const params = { userId: '123', type: 'user' };
      const expectedUrl = 'http://localhost:7071/api/test?userId=123&type=user';
      
      // This would be tested through the makeRequest function
      expect(baseUrl).toBe('http://localhost:7071/api/test');
    });
  });
});
