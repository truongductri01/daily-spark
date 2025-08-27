import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { 
  User, 
  Curriculum, 
  CreateUserRequest, 
  UpdateUserRequest, 
  CreateCurriculumRequest, 
  UpdateCurriculumRequest,
  ApiError,
  LoadingState
} from '../types';
import { apiService } from '../services';

// Enhanced state interface with granular loading states
interface AppState {
  user: User | null;
  curricula: Curriculum[];
  userCount: number | null;
  userLoading: LoadingState;
  curriculaLoading: LoadingState;
  operationLoading: LoadingState;
  userCountLoading: LoadingState;
}

// Enhanced action types
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRICULA'; payload: Curriculum[] }
  | { type: 'ADD_CURRICULUM'; payload: Curriculum }
  | { type: 'UPDATE_CURRICULUM'; payload: Curriculum }
  | { type: 'DELETE_CURRICULUM'; payload: string }
  | { type: 'SET_USER_COUNT'; payload: number }
  | { type: 'SET_USER_LOADING'; payload: LoadingState }
  | { type: 'SET_CURRICULA_LOADING'; payload: LoadingState }
  | { type: 'SET_OPERATION_LOADING'; payload: LoadingState }
  | { type: 'SET_USER_COUNT_LOADING'; payload: LoadingState }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  user: null,
  curricula: [],
  userCount: null,
  userLoading: { isLoading: false, error: null },
  curriculaLoading: { isLoading: false, error: null },
  operationLoading: { isLoading: false, error: null },
  userCountLoading: { isLoading: false, error: null },
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        userLoading: { isLoading: false, error: null } 
      };
    
    case 'SET_CURRICULA':
      return { 
        ...state, 
        curricula: action.payload, 
        curriculaLoading: { isLoading: false, error: null } 
      };
    
    case 'ADD_CURRICULUM':
      return { 
        ...state, 
        curricula: [...state.curricula, action.payload], 
        operationLoading: { isLoading: false, error: null } 
      };
    
    case 'UPDATE_CURRICULUM':
      return {
        ...state,
        curricula: state.curricula.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
        operationLoading: { isLoading: false, error: null }
      };
    
    case 'DELETE_CURRICULUM':
      return {
        ...state,
        curricula: state.curricula.filter(c => c.id !== action.payload),
        operationLoading: { isLoading: false, error: null }
      };
    
    case 'SET_USER_COUNT':
      return { 
        ...state, 
        userCount: action.payload,
        userCountLoading: { isLoading: false, error: null }
      };
    
    case 'SET_USER_LOADING':
      return { ...state, userLoading: action.payload };
    
    case 'SET_USER_COUNT_LOADING':
      return { ...state, userCountLoading: action.payload };
    
    case 'SET_CURRICULA_LOADING':
      return { ...state, curriculaLoading: action.payload };
    
    case 'SET_OPERATION_LOADING':
      return { ...state, operationLoading: action.payload };
    
    case 'LOGOUT':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Enhanced context interface with API operations
interface AppContextType {
  state: AppState;
  
  // User operations
  login: (userId: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userData: UpdateUserRequest) => Promise<void>;
  getUserCount: () => Promise<void>;
  
  // Curriculum operations
  loadCurricula: (userId: string) => Promise<void>;
  createCurriculum: (curriculumData: CreateCurriculumRequest) => Promise<void>;
  updateCurriculum: (curriculumData: UpdateCurriculumRequest) => Promise<void>;
  deleteCurriculum: (curriculumId: string, userId: string) => Promise<void>;
  
  // Utility functions
  clearErrors: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: false, error: null } });
    dispatch({ type: 'SET_CURRICULA_LOADING', payload: { isLoading: false, error: null } });
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: null } });
  }, []);

  // User operations
  const login = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.getUser(userId);
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to login',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.createUser(userData);
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to create user',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const updateUser = useCallback(async (userData: UpdateUserRequest) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.updateUser(userData.id, userData);
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to update user',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const getUserCount = useCallback(async () => {
    dispatch({ type: 'SET_USER_COUNT_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.getUserCount();
      
      if (response.success) {
        dispatch({ type: 'SET_USER_COUNT', payload: response.data.totalUsers });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to get user count',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_USER_COUNT_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_USER_COUNT_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  // Curriculum operations
  const loadCurricula = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_CURRICULA_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.getCurriculaByUserId(userId);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRICULA', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to load curricula',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_CURRICULA_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_CURRICULA_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const createCurriculum = useCallback(async (curriculumData: CreateCurriculumRequest) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.createCurriculum(curriculumData);
      
      if (response.success) {
        dispatch({ type: 'ADD_CURRICULUM', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to create curriculum',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const updateCurriculum = useCallback(async (curriculumData: UpdateCurriculumRequest) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.updateCurriculum(curriculumData.id, curriculumData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_CURRICULUM', payload: response.data });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to update curriculum',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const deleteCurriculum = useCallback(async (curriculumId: string, userId: string) => {
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.deleteCurriculum(curriculumId, userId);
      
      if (response.success) {
        dispatch({ type: 'DELETE_CURRICULUM', payload: curriculumId });
      } else {
        const error: ApiError = {
          message: response.message || 'Failed to delete curriculum',
          statusCode: 400,
          details: response
        };
        dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, []);

  const contextValue: AppContextType = {
    state,
    login,
    logout,
    createUser,
    updateUser,
    getUserCount,
    loadCurricula,
    createCurriculum,
    updateCurriculum,
    deleteCurriculum,
    clearErrors,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
