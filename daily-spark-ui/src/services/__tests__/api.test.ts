/**
 * API Service Tests
 * Tests for the real API service that replaces mock API
 */

import { apiService } from '../api';
import { httpClient } from '../httpClient';
import { 
  CreateUserRequest, 
  UpdateUserRequest, 
  CreateCurriculumRequest,
  UpdateCurriculumRequest,
  User,
  Curriculum,
  TopicStatus,
  CurriculumStatus
} from '../../types';

// Mock the httpClient
jest.mock('../httpClient');
const mockedHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Management', () => {
    const mockUser: User = {
      id: 'user-123',
      displayName: 'Test User',
      email: 'test@example.com',
      partitionKey: 'user-123'
    };

    describe('createUser', () => {
      it('should create user successfully', async () => {
        const userData: CreateUserRequest = {
          email: 'test@example.com',
          displayName: 'Test User'
        };

        mockedHttpClient.post.mockResolvedValueOnce({
          data: mockUser,
          status: 201,
          statusText: 'Created',
          headers: {}
        });

        const result = await apiService.createUser(userData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUser);
        expect(result.message).toBe('User created successfully');
        expect(mockedHttpClient.post).toHaveBeenCalledWith('/CreateUser', userData);
      });

      it('should handle create user error', async () => {
        const userData: CreateUserRequest = {
          email: 'test@example.com',
          displayName: 'Test User'
        };

        mockedHttpClient.post.mockRejectedValueOnce(new Error('Email already exists'));

        const result = await apiService.createUser(userData);

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.message).toBe('Email already exists');
      });
    });

    describe('getUser', () => {
      it('should get user successfully', async () => {
        mockedHttpClient.get.mockResolvedValueOnce({
          data: mockUser,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.getUser('user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUser);
        expect(mockedHttpClient.get).toHaveBeenCalledWith('/GetUser', { userId: 'user-123' });
      });

      it('should handle get user error', async () => {
        mockedHttpClient.get.mockRejectedValueOnce(new Error('User not found'));

        const result = await apiService.getUser('nonexistent');

        expect(result.success).toBe(false);
        expect(result.data).toBeNull();
        expect(result.message).toBe('User not found');
      });
    });

    describe('updateUser', () => {
      it('should update user successfully', async () => {
        const updateData: UpdateUserRequest = {
          id: 'user-123',
          displayName: 'Updated User'
        };

        const updatedUser = { ...mockUser, displayName: 'Updated User' };

        mockedHttpClient.put.mockResolvedValueOnce({
          data: updatedUser,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.updateUser('user-123', updateData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(updatedUser);
        expect(result.message).toBe('User updated successfully');
        expect(mockedHttpClient.put).toHaveBeenCalledWith('/UpdateUser', updateData);
      });
    });
  });

  describe('Curriculum Management', () => {
    const mockCurriculum: Curriculum = {
      id: 'curriculum-123',
      userId: 'user-123',
      courseTitle: 'Test Course',
      status: CurriculumStatus.NotStarted,
      nextReminderDate: '2024-01-01T00:00:00Z',
      topics: [
        {
          id: 'topic-1',
          title: 'Test Topic',
          description: 'Test Description',
          estimatedTime: 600, // 10 minutes
          question: 'Test Question?',
          resources: ['https://example.com'],
          status: TopicStatus.NotStarted
        }
      ],
      partitionKey: 'curriculum-123'
    };

    describe('createCurriculum', () => {
      it('should create curriculum successfully', async () => {
        const curriculumData: CreateCurriculumRequest = {
          userId: 'user-123',
          courseTitle: 'Test Course',
          status: CurriculumStatus.NotStarted,
          nextReminderDate: '2024-01-01T00:00:00Z',
          topics: [
            {
              id: 'topic-1',
              title: 'Test Topic',
              description: 'Test Description',
              estimatedTime: 600,
              question: 'Test Question?',
              resources: ['https://example.com'],
              status: TopicStatus.NotStarted
            }
          ]
        };

        mockedHttpClient.post.mockResolvedValueOnce({
          data: mockCurriculum,
          status: 201,
          statusText: 'Created',
          headers: {}
        });

        const result = await apiService.createCurriculum(curriculumData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCurriculum);
        expect(result.message).toBe('Curriculum created successfully');
        expect(mockedHttpClient.post).toHaveBeenCalledWith('/CreateCurriculum', curriculumData);
      });
    });

    describe('getCurriculum', () => {
      it('should get curriculum successfully', async () => {
        mockedHttpClient.get.mockResolvedValueOnce({
          data: mockCurriculum,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.getCurriculum('curriculum-123', 'user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockCurriculum);
        expect(mockedHttpClient.get).toHaveBeenCalledWith('/GetCurriculum', {
          curriculumId: 'curriculum-123',
          userId: 'user-123'
        });
      });
    });

    describe('getCurriculaByUserId', () => {
      it('should get curricula by user ID successfully', async () => {
        const curricula = [mockCurriculum];

        mockedHttpClient.get.mockResolvedValueOnce({
          data: curricula,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.getCurriculaByUserId('user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(curricula);
        expect(mockedHttpClient.get).toHaveBeenCalledWith('/GetCurriculaByUserId', {
          userId: 'user-123'
        });
      });
    });

    describe('updateCurriculum', () => {
      it('should update curriculum successfully', async () => {
        const updateData: UpdateCurriculumRequest = {
          id: 'curriculum-123',
          userId: 'user-123',
          courseTitle: 'Updated Course'
        };

        const updatedCurriculum = { ...mockCurriculum, courseTitle: 'Updated Course' };

        mockedHttpClient.put.mockResolvedValueOnce({
          data: updatedCurriculum,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.updateCurriculum('curriculum-123', updateData);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(updatedCurriculum);
        expect(result.message).toBe('Curriculum updated successfully');
        expect(mockedHttpClient.put).toHaveBeenCalledWith('/UpdateCurriculum', updateData);
      });
    });

    describe('deleteCurriculum', () => {
      it('should delete curriculum successfully', async () => {
        const deleteResponse = { success: true };

        mockedHttpClient.delete.mockResolvedValueOnce({
          data: deleteResponse,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.deleteCurriculum('curriculum-123', 'user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(deleteResponse);
        expect(result.message).toBe('Curriculum deleted successfully');
        expect(mockedHttpClient.delete).toHaveBeenCalledWith('/DeleteCurriculum', {
          curriculumId: 'curriculum-123',
          userId: 'user-123'
        });
      });
    });
  });

  describe('Additional Endpoints', () => {
    describe('queryCurriculumTopicsByUserId', () => {
      it('should query curriculum topics successfully', async () => {
        const topicsData = { topics: [] };

        mockedHttpClient.get.mockResolvedValueOnce({
          data: topicsData,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.queryCurriculumTopicsByUserId('user-123');

        expect(result.success).toBe(true);
        expect(result.data).toEqual(topicsData);
        expect(mockedHttpClient.get).toHaveBeenCalledWith('/QueryCurriculumTopicsByUserId', {
          userId: 'user-123'
        });
      });
    });

    describe('startProcessAllUsers', () => {
      it('should start process successfully', async () => {
        const processResponse = { processId: 'process-123' };

        mockedHttpClient.post.mockResolvedValueOnce({
          data: processResponse,
          status: 200,
          statusText: 'OK',
          headers: {}
        });

        const result = await apiService.startProcessAllUsers();

        expect(result.success).toBe(true);
        expect(result.data).toEqual(processResponse);
        expect(result.message).toBe('Process started successfully');
        expect(mockedHttpClient.post).toHaveBeenCalledWith('/StartProcessAllUsers');
      });
    });
  });
});
