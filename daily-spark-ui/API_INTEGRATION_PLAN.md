# API Integration Plan: Azure Functions with React UI

## Overview
This document outlines the comprehensive plan to integrate the Azure Functions APIs (UserFunctions.cs and CurriculumFunctions.cs) with the React UI, replacing the current mock API implementation.

## Current State Analysis

### Azure Functions Available
- **User Management**: CreateUser, GetUser, UpdateUser
- **Curriculum Management**: CreateCurriculum, GetCurriculum, GetCurriculaByUserId, UpdateCurriculum, DeleteCurriculum
- **Additional**: QueryCurriculumTopicsByUserId, ProcessAllUsersOrchestrator

### Current UI State
- Mock API service with simulated data
- React components ready for real API integration
- TypeScript types defined but may need alignment with Azure Functions models

## Integration Plan

### Phase 1: API Configuration & Infrastructure

#### 1.1 Create API Configuration
**File**: `src/config/api.ts`
**Purpose**: Centralized API endpoint configuration
**Content**:
```typescript
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

const config: ApiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:7071/api',
  timeout: 10000,
  retryAttempts: 3
}
```

#### 1.2 Define API Endpoints Schema
**File**: `src/config/endpoints.ts`
**Purpose**: Type-safe endpoint definitions
**Content**:
```typescript
export const ENDPOINTS = {
  // User endpoints
  CREATE_USER: '/CreateUser',
  GET_USER: '/GetUser',
  UPDATE_USER: '/UpdateUser',
  
  // Curriculum endpoints
  CREATE_CURRICULUM: '/CreateCurriculum',
  GET_CURRICULUM: '/GetCurriculum',
  GET_CURRICULA_BY_USER: '/GetCurriculaByUserId',
  UPDATE_CURRICULUM: '/UpdateCurriculum',
  DELETE_CURRICULUM: '/DeleteCurriculum',
  QUERY_CURRICULUM_TOPICS: '/QueryCurriculumTopicsByUserId'
} as const;
```

### Phase 2: API Service Layer

#### 2.1 Create HTTP Client Utility
**File**: `src/services/httpClient.ts`
**Purpose**: Centralized HTTP client with error handling
**Features**:
- Axios-based client with interceptors
- Error handling and retry logic
- Request/response logging
- Authentication token management (future enhancement)
- Type-safe request/response handling

#### 2.2 Create Real API Service
**File**: `src/services/api.ts`
**Purpose**: Replace mock API with real Azure Functions calls
**Structure**:
```typescript
export class ApiService {
  // User management
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>>
  async getUser(userId: string): Promise<ApiResponse<User>>
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>>
  
  // Curriculum management
  async createCurriculum(curriculumData: CreateCurriculumRequest): Promise<ApiResponse<Curriculum>>
  async getCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<Curriculum>>
  async getCurriculaByUserId(userId: string): Promise<ApiResponse<Curriculum[]>>
  async updateCurriculum(curriculumId: string, curriculumData: UpdateCurriculumRequest): Promise<ApiResponse<Curriculum>>
  async deleteCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<{ success: boolean }>>
}
```

### Phase 3: Type System Alignment

#### 3.1 Update Type Definitions
**File**: `src/types/index.ts`
**Purpose**: Align UI types with Azure Functions models
**Updates**:
- Match `User` interface with Azure Functions `User` model
- Match `Curriculum` interface with Azure Functions `Curriculum` model
- Add request/response types for API calls
- Add error handling types
- Add loading state types

**New Types to Add**:
```typescript
// Request types
export interface CreateUserRequest {
  id?: string;
  email: string;
  displayName: string;
}

export interface UpdateUserRequest {
  id: string;
  email?: string;
  displayName?: string;
}

export interface CreateCurriculumRequest {
  id?: string;
  userId: string;
  courseTitle: string;
  status: CurriculumStatus;
  nextReminderDate: string;
  topics: Topic[];
}

export interface UpdateCurriculumRequest {
  id: string;
  userId: string;
  courseTitle?: string;
  status?: CurriculumStatus;
  nextReminderDate?: string;
  topics?: Topic[];
}

// Response types
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}
```

### Phase 4: Context & State Management

#### 4.1 Update App Context
**File**: `src/context/AppContext.tsx`
**Purpose**: Integrate real API calls with React context
**Updates**:
- Replace mock API calls with real API service
- Add loading states for API calls
- Add error handling and user feedback
- Maintain authentication state
- Add retry logic for failed requests

**New Context Features**:
```typescript
interface AppContextType {
  // User state
  user: User | null;
  isLoadingUser: boolean;
  userError: ApiError | null;
  
  // Curriculum state
  curricula: Curriculum[];
  isLoadingCurricula: boolean;
  curriculaError: ApiError | null;
  
  // Actions
  login: (userId: string) => Promise<void>;
  logout: () => void;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (userData: UpdateUserRequest) => Promise<void>;
  loadCurricula: (userId: string) => Promise<void>;
  createCurriculum: (curriculumData: CreateCurriculumRequest) => Promise<void>;
  updateCurriculum: (curriculumData: UpdateCurriculumRequest) => Promise<void>;
  deleteCurriculum: (curriculumId: string, userId: string) => Promise<void>;
}
```

### Phase 5: Component Integration

#### 5.1 Update Authentication Flow
**Files**: 
- `src/pages/LoginPage.tsx`
- `src/pages/ProfilePage.tsx`

**Purpose**: Connect login/signup with Azure Functions
**Features**:
- User creation via `CreateUser` function
- User retrieval via `GetUser` function
- User updates via `UpdateUser` function
- Loading states and error handling
- Form validation matching server requirements

#### 5.2 Update Curriculum Management
**Files**:
- `src/pages/CurriculumListPage.tsx`
- `src/pages/CurriculumEditPage.tsx`
- `src/pages/CurriculumUploadPage.tsx`

**Purpose**: Connect curriculum CRUD operations with Azure Functions
**Features**:
- Curriculum creation via `CreateCurriculum` function
- Curriculum listing via `GetCurriculaByUserId` function
- Curriculum updates via `UpdateCurriculum` function
- Curriculum deletion via `DeleteCurriculum` function
- Real-time data synchronization
- Optimistic updates for better UX

### Phase 6: Error Handling & User Experience

#### 6.1 Add Error Boundaries
**File**: `src/components/ErrorBoundary.tsx`
**Purpose**: Graceful error handling for API failures
**Features**:
- Catch JavaScript errors in component tree
- Display fallback UI when errors occur
- Log errors for debugging
- Provide retry mechanisms

#### 6.2 Add Loading States
**Purpose**: Show loading indicators during API calls
**Implementation**: 
- Update components to show loading states
- Add skeleton loaders for better UX
- Implement optimistic updates where appropriate

#### 6.3 Add Toast Notifications
**File**: `src/components/Toast.tsx`
**Purpose**: User feedback for API operations
**Features**:
- Success notifications for successful operations
- Error notifications for failed operations
- Warning notifications for validation errors
- Auto-dismiss functionality
- Multiple notification types (success, error, warning, info)

### Phase 7: Development & Testing

#### 7.1 Environment Configuration
**File**: `.env.local`
**Purpose**: Local development environment variables
**Content**:
```
REACT_APP_API_BASE_URL=http://localhost:7071/api
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_LOGGING=true
```

#### 7.2 Add API Testing Utilities
**File**: `src/utils/apiTestUtils.ts`
**Purpose**: Helper functions for testing API integration
**Features**:
- Mock API responses for testing
- Test data generators
- API call interceptors for testing
- Error simulation utilities

## Implementation Order

1. **Phase 1**: API Configuration & Infrastructure
   - Create API configuration files
   - Set up environment variables
   - Define endpoint schemas

2. **Phase 2**: API Service Layer
   - Create HTTP client utility
   - Implement real API service
   - Add error handling and retry logic

3. **Phase 3**: Type System Alignment
   - Update TypeScript types
   - Add request/response interfaces
   - Ensure type safety across the application

4. **Phase 4**: Context & State Management
   - Update AppContext with real API calls
   - Add loading states and error handling
   - Implement state management patterns

5. **Phase 5**: Component Integration
   - Update authentication components
   - Update curriculum management components
   - Add loading states and error handling to UI

6. **Phase 6**: Error Handling & User Experience
   - Add error boundaries
   - Implement toast notifications
   - Enhance loading states

7. **Phase 7**: Development & Testing
   - Set up environment configuration
   - Add testing utilities
   - Perform integration testing

## Key Considerations

### Authentication & Security
- Currently using simple user ID authentication
- Consider implementing proper JWT tokens for production
- Add request/response encryption for sensitive data
- Implement proper CORS configuration

### Error Handling
- Network connectivity issues
- Server validation errors
- Authentication/authorization errors
- Rate limiting and throttling
- Graceful degradation when services are unavailable

### Performance
- Implement request caching for frequently accessed data
- Add request debouncing for search operations
- Optimize bundle size by code splitting
- Implement virtual scrolling for large lists

### User Experience
- Loading states for all async operations
- Optimistic updates for better perceived performance
- Offline support with local storage
- Progressive enhancement for better accessibility

### Testing Strategy
- Unit tests for API service functions
- Integration tests for API calls
- End-to-end tests for user workflows
- Error scenario testing
- Performance testing for API response times

## Success Metrics

- [ ] All mock API calls replaced with real Azure Functions calls
- [ ] Type safety maintained across the application
- [ ] Error handling implemented for all API operations
- [ ] Loading states implemented for better UX
- [ ] Authentication flow working end-to-end
- [ ] Curriculum CRUD operations working end-to-end
- [ ] All existing functionality preserved
- [ ] Performance maintained or improved
- [ ] Comprehensive error handling in place
- [ ] Testing coverage for API integration

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 implementation
3. Set up development environment for Azure Functions
4. Begin systematic implementation of each phase
5. Test each phase before moving to the next
6. Document any deviations from the plan
7. Perform final integration testing
8. Deploy to staging environment for validation
