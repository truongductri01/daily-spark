import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Curriculum } from '../types';

// State interface
interface AppState {
  user: User | null;
  curricula: Curriculum[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRICULA'; payload: Curriculum[] }
  | { type: 'ADD_CURRICULUM'; payload: Curriculum }
  | { type: 'UPDATE_CURRICULUM'; payload: Curriculum }
  | { type: 'DELETE_CURRICULUM'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AppState = {
  user: null,
  curricula: [],
  isLoading: false,
  error: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    
    case 'SET_CURRICULA':
      return { ...state, curricula: action.payload, error: null };
    
    case 'ADD_CURRICULUM':
      return { ...state, curricula: [...state.curricula, action.payload], error: null };
    
    case 'UPDATE_CURRICULUM':
      return {
        ...state,
        curricula: state.curricula.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
        error: null
      };
    
    case 'DELETE_CURRICULUM':
      return {
        ...state,
        curricula: state.curricula.filter(c => c.id !== action.payload),
        error: null
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'LOGOUT':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
