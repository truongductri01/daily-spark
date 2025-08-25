# User Functions Testing Guide

This document provides examples of how to test the consolidated UserFunctions that include CreateUser, GetUser, and UpdateUser functions.

## Prerequisites

1. Ensure the Azure Functions runtime is running locally
2. Verify Cosmos DB connection settings in `local.settings.json`
3. Make sure the `users` container exists in your Cosmos DB

## Testing CreateUser Function

### Endpoint
- **URL**: `POST /api/CreateUser`
- **Authorization**: Anonymous

### Test Cases

#### 1. Create User with Auto-Generated ID
```bash
curl -X POST http://localhost:7071/api/CreateUser \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "displayName": "John Doe"
  }'
```

**Expected Response**:
```json
{
  "id": "generated-guid-here",
  "email": "john.doe@example.com",
  "displayName": "John Doe"
}
```

#### 2. Create User with Custom ID
```bash
curl -X POST http://localhost:7071/api/CreateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "jane.smith@example.com",
    "displayName": "Jane Smith"
  }'
```

#### 3. Create User with Existing ID (Should Fail)
```bash
curl -X POST http://localhost:7071/api/CreateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "another@example.com",
    "displayName": "Another User"
  }'
```

**Expected Response**: 400 Bad Request with message "User with ID 'user123' already exists"

#### 4. Create User Missing Required Fields (Should Fail)
```bash
curl -X POST http://localhost:7071/api/CreateUser \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com"
  }'
```

**Expected Response**: 400 Bad Request with message "DisplayName is required"

## Testing GetUser Function

### Endpoint
- **URL**: `GET /api/GetUser?userId={userId}`
- **Authorization**: Anonymous

### Test Cases

#### 1. Get Existing User
```bash
curl -X GET "http://localhost:7071/api/GetUser?userId=user123"
```

**Expected Response**:
```json
{
  "id": "user123",
  "email": "jane.smith@example.com",
  "displayName": "Jane Smith",
  "partitionKey": "user123"
}
```

#### 2. Get Non-Existent User (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetUser?userId=nonexistent"
```

**Expected Response**: 404 Not Found with message "User with ID 'nonexistent' not found"

#### 3. Get User Missing UserId (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetUser"
```

**Expected Response**: 400 Bad Request with message "Please pass a userId on the query string"

## Testing UpdateUser Function

### Endpoint
- **URL**: `PUT /api/UpdateUser`
- **Authorization**: Anonymous

### Test Cases

#### 1. Update User Email
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "jane.smith.updated@example.com"
  }'
```

**Expected Response**:
```json
{
  "id": "user123",
  "email": "jane.smith.updated@example.com",
  "displayName": "Jane Smith",
  "partitionKey": "user123"
}
```

#### 2. Update User Display Name
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "displayName": "Jane Smith Updated"
  }'
```

#### 3. Update Multiple Fields
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "jane.final@example.com",
    "displayName": "Jane Smith Final"
  }'
```

#### 4. Update Non-Existent User (Should Fail)
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "nonexistent",
    "email": "test@example.com"
  }'
```

**Expected Response**: 404 Not Found with message "User with ID 'nonexistent' not found"

#### 5. Update User Missing UserId (Should Fail)
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response**: 400 Bad Request with message "Id is required"

#### 6. Update User with No Changes
```bash
curl -X PUT http://localhost:7071/api/UpdateUser \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user123",
    "email": "jane.final@example.com"
  }'
```

**Expected Response**: 200 OK with user data (no changes detected)

## Verification in Cosmos DB

After running the tests, you can verify the data in your Cosmos DB:

1. Navigate to Azure Portal > Cosmos DB > daily-spark
2. Go to Data Explorer > users container
3. Query: `SELECT * FROM c` to see all users
4. Query: `SELECT * FROM c WHERE c.id = 'user123'` to see specific user

## Error Handling

Both functions include comprehensive error handling:
- **400 Bad Request**: Invalid input data or missing required fields
- **404 Not Found**: User not found (UpdateUser only)
- **500 Internal Server Error**: Unexpected errors (logged for debugging)

## Logging

All operations are logged with appropriate log levels:
- Information: Successful operations
- Warning: Business logic warnings
- Error: Exceptions and errors

Check the function logs in Azure Portal or local console for debugging information.
