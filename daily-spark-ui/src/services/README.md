# Services Module

This module contains all service-related code for the Daily Spark application, including HTTP client utilities and API services for Azure Functions integration.

## Files

### `httpClient.ts`
Centralized HTTP client with advanced features:
- Error handling and retry logic with exponential backoff
- Request/response interceptors and logging
- Timeout handling with AbortController
- Type-safe request/response handling
- Network error detection and handling

### `api.ts`
Real API service that replaces mock API:
- User management (create, get, update)
- Curriculum management (create, get, update, delete, query)
- Type-safe request/response handling
- Error conversion and response wrapping
- Consistent API response format

### `index.ts`
Centralized exports for all service modules.

## Usage

### HTTP Client

```typescript
import { httpClient, makeRequest } from '../services';

// Using convenience methods
const user = await httpClient.get<User>('/GetUser', { userId: '123' });
const newUser = await httpClient.post<User>('/CreateUser', userData);
const updatedUser = await httpClient.put<User>('/UpdateUser', updateData);
const deleted = await httpClient.delete<{ success: boolean }>('/DeleteUser');

// Using makeRequest for more control
const response = await makeRequest({
  method: 'POST',
  url: '/CreateUser',
  data: userData,
  headers: { 'Custom-Header': 'value' }
});
```

### API Service

```typescript
import { apiService } from '../services';

// User management
const userResponse = await apiService.createUser({
  email: 'user@example.com',
  displayName: 'John Doe'
});

const user = await apiService.getUser('user-123');
const updatedUser = await apiService.updateUser('user-123', {
  id: 'user-123',
  displayName: 'Updated Name'
});

// Curriculum management
const curriculum = await apiService.createCurriculum({
  userId: 'user-123',
  courseTitle: 'System Design',
  status: CurriculumStatus.NotStarted,
  nextReminderDate: '2024-01-01T00:00:00Z',
  topics: []
});

const curricula = await apiService.getCurriculaByUserId('user-123');
const updatedCurriculum = await apiService.updateCurriculum('curriculum-123', {
  id: 'curriculum-123',
  userId: 'user-123',
  courseTitle: 'Updated Course'
});

const deleted = await apiService.deleteCurriculum('curriculum-123', 'user-123');
```

## Error Handling

The services provide comprehensive error handling:

### HTTP Client Errors

```typescript
import { ApiError, NetworkError } from '../services';

try {
  const response = await httpClient.get('/GetUser');
} catch (error) {
  if (error instanceof ApiError) {
    // HTTP error (4xx, 5xx)
    console.log(`HTTP ${error.status}: ${error.message}`);
  } else if (error instanceof NetworkError) {
    // Network error (timeout, connection failed)
    console.log(`Network error: ${error.message}`);
  }
}
```

### API Service Errors

```typescript
const response = await apiService.getUser('user-123');

if (response.success) {
  // Handle success
  console.log(response.data);
} else {
  // Handle error
  console.log(`Error: ${response.message}`);
}
```

## Configuration

The HTTP client uses the configuration from `../config/api.ts`:

- **Timeout**: Configurable request timeout
- **Retry Attempts**: Number of retry attempts for failed requests
- **Retry Delay**: Base delay for exponential backoff
- **Logging**: Development-friendly request/response logging

## Retry Logic

The HTTP client implements intelligent retry logic:

- **Automatic Retries**: Failed requests are automatically retried
- **Exponential Backoff**: Delay increases exponentially between retries
- **Smart Retry**: Doesn't retry client errors (4xx) except 429 (rate limit)
- **Timeout Handling**: Requests are aborted if they exceed the timeout

## Response Format

All API service methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
}
```

### Success Response
```typescript
{
  data: { id: 'user-123', displayName: 'John Doe' },
  success: true,
  message: 'User created successfully'
}
```

### Error Response
```typescript
{
  data: null,
  success: false,
  message: 'User not found'
}
```

## Testing

Run the service tests:

```bash
# HTTP Client tests
npm test -- src/services/__tests__/httpClient.test.ts --watchAll=false

# API Service tests
npm test -- src/services/__tests__/api.test.ts --watchAll=false
```

## Migration from Mock API

The API service is designed to be a drop-in replacement for the mock API:

```typescript
// Before (mock API)
import { mockApi } from '../services/mockApi';
const user = await mockApi.getUser('user-123');

// After (real API)
import { apiService } from '../services';
const response = await apiService.getUser('user-123');
if (response.success) {
  const user = response.data;
}
```

## Available Methods

### User Management
- `createUser(userData: CreateUserRequest): Promise<ApiResponse<User>>`
- `getUser(userId: string): Promise<ApiResponse<User>>`
- `updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>>`

### Curriculum Management
- `createCurriculum(curriculumData: CreateCurriculumRequest): Promise<ApiResponse<Curriculum>>`
- `getCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<Curriculum>>`
- `getCurriculaByUserId(userId: string): Promise<ApiResponse<Curriculum[]>>`
- `updateCurriculum(curriculumId: string, curriculumData: UpdateCurriculumRequest): Promise<ApiResponse<Curriculum>>`
- `deleteCurriculum(curriculumId: string, userId: string): Promise<ApiResponse<{ success: boolean }>>`

### Additional Endpoints
- `queryCurriculumTopicsByUserId(userId: string): Promise<ApiResponse<any>>`
- `startProcessAllUsers(): Promise<ApiResponse<any>>`
