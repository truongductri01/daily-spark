import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
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
  isInitialized: boolean; // Track if initial auth check is complete
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
  | { type: 'SET_CURRICULUM_LOADING'; payload: LoadingState }
  | { type: 'SET_OPERATION_LOADING'; payload: LoadingState }
  | { type: 'SET_USER_COUNT_LOADING'; payload: LoadingState }
  | { type: 'SET_INITIALIZED'; payload: boolean }
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
  isInitialized: false,
};

// Storage keys
const STORAGE_KEYS = {
  // Session storage (cleared on logout/browser close)
  SESSION: 'daily-spark-session',
  
  // Encrypted localStorage
  ENCRYPTED_USER: 'daily-spark-user-encrypted',
  ENCRYPTED_CURRICULA: 'daily-spark-curricula-encrypted',
};

// Simple encryption/decryption (in production, use a proper crypto library)
const ENCRYPTION_KEY = process.env.REACT_APP_STORAGE_KEY || 'daily-spark-fallback-key-2024';

const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple XOR encryption with the key (in production, use proper crypto library)
    const encrypted = jsonString.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    return btoa(encrypted); // Base64 encode the XOR result
  } catch (error) {
    console.warn('Encryption failed:', error);
    return '';
  }
};

const decryptData = (encryptedData: string): any => {
  try {
    // Base64 decode first, then XOR decrypt
    const decoded = atob(encryptedData);
    const decrypted = decoded.split('').map((char, index) => {
      const keyChar = ENCRYPTION_KEY[index % ENCRYPTION_KEY.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join('');
    return JSON.parse(decrypted);
  } catch (error) {
    console.warn('Decryption failed:', error);
    return null;
  }
};

// Session storage helpers (minimal data)
const getSessionData = (): { userId: string; token: string; timestamp: number } | null => {
  try {
    const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

const setSessionData = (userId: string, token: string) => {
  const sessionData = {
    userId,
    token,
    timestamp: Date.now()
  };
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
};

const clearSessionData = () => {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
};

// Encrypted storage helpers (sensitive data)
const getStoredUser = (): User | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_USER);
    return encrypted ? decryptData(encrypted) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user: User | null) => {
  if (user) {
    const encrypted = encryptData(user);
    localStorage.setItem(STORAGE_KEYS.ENCRYPTED_USER, encrypted);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_USER);
  }
};

const getStoredCurricula = (): Curriculum[] => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_CURRICULA);
    return encrypted ? decryptData(encrypted) : [];
  } catch {
    return [];
  }
};

const setStoredCurricula = (curricula: Curriculum[]) => {
  const encrypted = encryptData(curricula);
  localStorage.setItem(STORAGE_KEYS.ENCRYPTED_CURRICULA, encrypted);
};

const clearEncryptedData = () => {
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_USER);
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_CURRICULA);
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      setStoredUser(action.payload);
      return { 
        ...state, 
        user: action.payload, 
        userLoading: { isLoading: false, error: null } 
      };
    
    case 'SET_CURRICULA':
      setStoredCurricula(action.payload);
      return { 
        ...state, 
        curricula: action.payload, 
        curriculaLoading: { isLoading: false, error: null } 
      };
    
    case 'ADD_CURRICULUM':
      const newCurricula = [...state.curricula, action.payload];
      setStoredCurricula(newCurricula);
      return { 
        ...state, 
        curricula: newCurricula, 
        operationLoading: { isLoading: false, error: null } 
      };
    
    case 'UPDATE_CURRICULUM':
      const updatedCurricula = state.curricula.map(c => 
        c.id === action.payload.id ? action.payload : c
      );
      setStoredCurricula(updatedCurricula);
      return {
        ...state,
        curricula: updatedCurricula,
        operationLoading: { isLoading: false, error: null }
      };
    
    case 'DELETE_CURRICULUM':
      const filteredCurricula = state.curricula.filter(c => c.id !== action.payload);
      setStoredCurricula(filteredCurricula);
      return {
        ...state,
        curricula: filteredCurricula,
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
    
    case 'SET_CURRICULUM_LOADING':
      return { ...state, curriculaLoading: action.payload };
    
    case 'SET_OPERATION_LOADING':
      return { ...state, operationLoading: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'LOGOUT':
      clearSessionData();
      clearEncryptedData();
      return { ...initialState, isInitialized: true };
    
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
  loadCurricula: (userId: string, forceRefresh?: boolean) => Promise<void>;
  createCurriculum: (curriculumData: CreateCurriculumRequest) => Promise<void>;
  updateCurriculum: (curriculumData: UpdateCurriculumRequest) => Promise<void>;
  deleteCurriculum: (curriculumId: string, userId: string) => Promise<void>;
  
  // Utility functions
  clearErrors: () => void;
  initializeAuth: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    user: getStoredUser(),
    curricula: getStoredCurricula(),
  });

  // Initialize authentication on app start
  const initializeAuth = useCallback(async () => {
    const sessionData = getSessionData();
    const storedUser = getStoredUser();
    
    if (sessionData && storedUser) {
      // Verify the stored user is still valid
      try {
        const response = await apiService.getUser(storedUser.id);
        if (response.success) {
          dispatch({ type: 'SET_USER', payload: response.data });
        } else {
          // Stored user is invalid, clear everything
          clearSessionData();
          clearEncryptedData();
        }
      } catch (error) {
        // Network error, keep stored user but mark as initialized
        console.warn('Failed to verify stored user:', error);
      }
    } else if (sessionData && !storedUser) {
      // Session exists but no user data, clear session
      clearSessionData();
    }
    
    dispatch({ type: 'SET_INITIALIZED', payload: true });
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: false, error: null } });
    dispatch({ type: 'SET_CURRICULUM_LOADING', payload: { isLoading: false, error: null } });
    dispatch({ type: 'SET_OPERATION_LOADING', payload: { isLoading: false, error: null } });
  }, []);

  // User operations
  const login = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_USER_LOADING', payload: { isLoading: true, error: null } });
    
    try {
      const response = await apiService.getUser(userId);
      
      if (response.success) {
        // Store session data and user data
        setSessionData(userId, 'session-token'); // In production, use real JWT token
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
        // Store session data and user data
        setSessionData(userData.id || response.data.id, 'session-token'); // In production, use real JWT token
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

  const loadCurricula = useCallback(async (userId: string, forceRefresh = false) => {
    // Don't load if we already have data and not forcing refresh
    if (!forceRefresh && state.curricula.length > 0 && !state.curriculaLoading.isLoading) {
      return;
    }

    dispatch({ type: 'SET_CURRICULUM_LOADING', payload: { isLoading: true, error: null } });
    
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
        dispatch({ type: 'SET_CURRICULUM_LOADING', payload: { isLoading: false, error } });
      }
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        statusCode: 500,
        details: error
      };
      dispatch({ type: 'SET_CURRICULUM_LOADING', payload: { isLoading: false, error: apiError } });
    }
  }, [state.curricula.length, state.curriculaLoading.isLoading]);

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
    initializeAuth,
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
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
