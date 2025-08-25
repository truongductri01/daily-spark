# Configuration Module

This module contains all configuration-related code for the Daily Spark application, specifically for API integration with Azure Functions.

## Files

### `api.ts`
Centralized API configuration including:
- Base URL configuration
- Timeout settings
- Retry logic configuration
- Logging settings
- Helper functions for URL construction and logging

### `endpoints.ts`
Type-safe endpoint definitions including:
- All Azure Functions endpoints
- HTTP methods for each endpoint
- Required query parameters
- Helper functions for endpoint management

### `index.ts`
Centralized exports for all configuration modules.

## Usage

### Basic Configuration
```typescript
import { apiConfig, getApiUrl } from '../config';

// Get the base URL
console.log(apiConfig.baseUrl); // http://localhost:7071/api

// Get full URL for an endpoint
const url = getApiUrl('/CreateUser'); // http://localhost:7071/api/CreateUser
```

### Endpoint Management
```typescript
import { ENDPOINTS, getEndpoint, getEndpointMethod, getEndpointQueryParams } from '../config';

// Get endpoint URL
const endpoint = getEndpoint('CREATE_USER'); // '/CreateUser'

// Get HTTP method
const method = getEndpointMethod('CREATE_USER'); // 'POST'

// Get required query parameters
const params = getEndpointQueryParams('GET_USER'); // ['userId']
```

### Logging
```typescript
import { logApiCall, logApiResponse, logApiError } from '../config';

// Log API calls (only in development or when enabled)
logApiCall('POST', '/CreateUser', { email: 'test@example.com' });

// Log API responses
logApiResponse('POST', '/CreateUser', 200, { id: 'user-123' });

// Log API errors
logApiError('POST', '/CreateUser', new Error('Network error'));
```

## Environment Variables

The configuration uses the following environment variables:

- `REACT_APP_API_BASE_URL`: Base URL for Azure Functions API
- `REACT_APP_API_TIMEOUT`: Request timeout in milliseconds
- `REACT_APP_API_RETRY_ATTEMPTS`: Number of retry attempts
- `REACT_APP_API_RETRY_DELAY`: Delay between retries in milliseconds
- `REACT_APP_ENABLE_LOGGING`: Enable API call logging

## Testing

Run the configuration tests:
```bash
npm test -- src/config/__tests__/api.test.ts
```

## Available Endpoints

### User Management
- `CREATE_USER`: POST - Create a new user
- `GET_USER`: GET - Get user by ID (requires userId query param)
- `UPDATE_USER`: PUT - Update user information

### Curriculum Management
- `CREATE_CURRICULUM`: POST - Create a new curriculum
- `GET_CURRICULUM`: GET - Get curriculum by ID (requires curriculumId and userId query params)
- `GET_CURRICULA_BY_USER`: GET - Get all curricula for a user (requires userId query param)
- `UPDATE_CURRICULUM`: PUT - Update curriculum information
- `DELETE_CURRICULUM`: DELETE - Delete curriculum (requires curriculumId and userId query params)

### Additional
- `QUERY_CURRICULUM_TOPICS`: GET - Query curriculum topics by user ID
- `START_PROCESS_ALL_USERS`: POST - Start processing for all users
