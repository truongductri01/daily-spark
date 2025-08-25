import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { apiService } from '../../services';
import { ApiResponse, User } from '../../types';

// Mock the API service
jest.mock('../../services', () => ({
  apiService: {
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    getCurriculaByUserId: jest.fn(),
    createCurriculum: jest.fn(),
    updateCurriculum: jest.fn(),
    deleteCurriculum: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Test component to access context
const TestComponent: React.FC = () => {
  const { state, login, createUser, updateUser, loadCurricula, createCurriculum, updateCurriculum, deleteCurriculum, clearErrors } = useAppContext();
  
  return (
    <div>
      <div data-testid="user">{state.user ? state.user.displayName : 'No user'}</div>
      <div data-testid="curricula-count">{state.curricula.length}</div>
      <div data-testid="user-loading">{state.userLoading.isLoading.toString()}</div>
      <div data-testid="curricula-loading">{state.curriculaLoading.isLoading.toString()}</div>
      <div data-testid="operation-loading">{state.operationLoading.isLoading.toString()}</div>
      <div data-testid="user-error">{state.userLoading.error?.message || 'No error'}</div>
      <div data-testid="curricula-error">{state.curriculaLoading.error?.message || 'No error'}</div>
      <div data-testid="operation-error">{state.operationLoading.error?.message || 'No error'}</div>
      
      <button onClick={() => login('test-user')} data-testid="login-btn">Login</button>
      <button onClick={() => createUser({ id: 'test', displayName: 'Test User', email: 'test@example.com' })} data-testid="create-user-btn">Create User</button>
      <button onClick={() => updateUser({ id: 'test', displayName: 'Updated User' })} data-testid="update-user-btn">Update User</button>
      <button onClick={() => loadCurricula('test-user')} data-testid="load-curricula-btn">Load Curricula</button>
      <button onClick={() => createCurriculum({ userId: 'test', courseTitle: 'Test Course', status: 'NotStarted' as any, nextReminderDate: '2024-01-01', topics: [] })} data-testid="create-curriculum-btn">Create Curriculum</button>
      <button onClick={() => updateCurriculum({ id: 'test', userId: 'test', courseTitle: 'Updated Course' })} data-testid="update-curriculum-btn">Update Curriculum</button>
      <button onClick={() => deleteCurriculum('test', 'test-user')} data-testid="delete-curriculum-btn">Delete Curriculum</button>
      <button onClick={clearErrors} data-testid="clear-errors-btn">Clear Errors</button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('curricula-count')).toHaveTextContent('0');
      expect(screen.getByTestId('user-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('curricula-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user-error')).toHaveTextContent('No error');
      expect(screen.getByTestId('curricula-error')).toHaveTextContent('No error');
      expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
    });
  });

  describe('User Operations', () => {
    it('should handle successful login', async () => {
      const mockUser = { id: 'test', displayName: 'Test User', email: 'test@example.com' };
      mockApiService.getUser.mockResolvedValue({ success: true, data: mockUser });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('Test User');
        expect(screen.getByTestId('user-error')).toHaveTextContent('No error');
      });
    });

    it('should handle login error', async () => {
      mockApiService.getUser.mockResolvedValue({ success: false, message: 'User not found', data: null as any });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user-error')).toHaveTextContent('User not found');
      });
    });

    it('should handle successful user creation', async () => {
      const mockUser = { id: 'test', displayName: 'Test User', email: 'test@example.com' };
      mockApiService.createUser.mockResolvedValue({ success: true, data: mockUser });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('create-user-btn').click();
      });

      // Wait for the operation to complete
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      });

      // Then check that loading is false
      expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
    });

    it('should handle successful user update', async () => {
      const mockUser = { id: 'test', displayName: 'Updated User', email: 'test@example.com' };
      mockApiService.updateUser.mockResolvedValue({ success: true, data: mockUser });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('update-user-btn').click();
      });

      // Wait for the operation to complete
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Updated User');
      });

      // Then check that loading is false
      expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
    });
  });

  describe('Curriculum Operations', () => {
    it('should handle successful curricula loading', async () => {
      const mockCurricula = [
        { id: '1', userId: 'test', courseTitle: 'Course 1', status: 'NotStarted' as any, nextReminderDate: '2024-01-01', topics: [] },
        { id: '2', userId: 'test', courseTitle: 'Course 2', status: 'InProgress' as any, nextReminderDate: '2024-01-02', topics: [] }
      ];
      mockApiService.getCurriculaByUserId.mockResolvedValue({ success: true, data: mockCurricula });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('load-curricula-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('curricula-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('curricula-count')).toHaveTextContent('2');
        expect(screen.getByTestId('curricula-error')).toHaveTextContent('No error');
      });
    });

    it('should handle successful curriculum creation', async () => {
      const mockCurriculum = { id: '1', userId: 'test', courseTitle: 'Test Course', status: 'NotStarted' as any, nextReminderDate: '2024-01-01', topics: [] };
      mockApiService.createCurriculum.mockResolvedValue({ success: true, data: mockCurriculum });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('create-curriculum-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('curricula-count')).toHaveTextContent('1');
        expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
      });
    });

    it('should handle successful curriculum update', async () => {
      const mockCurriculum = { id: '1', userId: 'test', courseTitle: 'Updated Course', status: 'InProgress' as any, nextReminderDate: '2024-01-01', topics: [] };
      mockApiService.updateCurriculum.mockResolvedValue({ success: true, data: mockCurriculum });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('update-curriculum-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
      });
    });

    it('should handle successful curriculum deletion', async () => {
      mockApiService.deleteCurriculum.mockResolvedValue({ success: true, data: { success: true } });

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('delete-curriculum-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('operation-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      mockApiService.getUser.mockRejectedValue(new Error('Network error'));

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user-error')).toHaveTextContent('Network error');
      });
    });

    it('should clear errors when clearErrors is called', async () => {
      mockApiService.getUser.mockRejectedValue(new Error('Network error'));

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-error')).toHaveTextContent('Network error');
      });

      await act(async () => {
        screen.getByTestId('clear-errors-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-error')).toHaveTextContent('No error');
        expect(screen.getByTestId('curricula-error')).toHaveTextContent('No error');
        expect(screen.getByTestId('operation-error')).toHaveTextContent('No error');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during API calls', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const promise = new Promise<ApiResponse<User>>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApiService.getUser.mockReturnValue(promise);

      renderWithProvider(<TestComponent />);
      
      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      // Should be loading
      expect(screen.getByTestId('user-loading')).toHaveTextContent('true');

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true, data: { id: 'test', displayName: 'Test User', email: 'test@example.com' } });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-loading')).toHaveTextContent('false');
      });
    });
  });
});
