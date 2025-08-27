# Curriculum Functions Testing Guide

This document provides examples of how to test the consolidated CurriculumFunctions that include GetCurriculaByUserId, GetCurriculum, CreateCurriculum, and UpdateCurriculum functions.

## Prerequisites

1. Ensure the Azure Functions runtime is running locally
2. Verify Cosmos DB connection settings in `local.settings.json`
3. Make sure the `curricula` container exists in your Cosmos DB
4. Ensure you have at least one user created to test with

## Testing GetCurriculaByUserId Function

### Endpoint
- **URL**: `GET /api/GetCurriculaByUserId?userId={userId}`
- **Authorization**: Anonymous

### Test Cases

#### 1. Get Curricula for Existing User
```bash
curl -X GET "http://localhost:7071/api/GetCurriculaByUserId?userId=user123"
```

**Expected Response**: 200 OK with array of curricula (may be empty if user has no curricula)

#### 2. Get Curricula Missing UserId (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetCurriculaByUserId"
```

**Expected Response**: 400 Bad Request with message "Please pass a userId on the query string"

## Testing GetCurriculum Function

### Endpoint
- **URL**: `GET /api/GetCurriculum?curriculumId={curriculumId}&userId={userId}`
- **Authorization**: Anonymous

### Test Cases

#### 1. Get Existing Curriculum
```bash
curl -X GET "http://localhost:7071/api/GetCurriculum?curriculumId=curriculum123&userId=user123"
```

**Expected Response**:
```json
{
  "id": "curriculum123",
  "userId": "user123",
  "courseTitle": "Advanced Mathematics",
  "status": "Active",
  "nextReminderDate": "2024-01-15T10:00:00Z",
  "topics": [],
  "partitionKey": "user123"
}
```

#### 2. Get Non-Existent Curriculum (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetCurriculum?curriculumId=nonexistent&userId=user123"
```

**Expected Response**: 404 Not Found with message "Curriculum with ID 'nonexistent' not found for user 'user123'"

#### 3. Get Curriculum Missing CurriculumId (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetCurriculum?userId=user123"
```

**Expected Response**: 400 Bad Request with message "Please pass a curriculumId on the query string"

#### 4. Get Curriculum Missing UserId (Should Fail)
```bash
curl -X GET "http://localhost:7071/api/GetCurriculum?curriculumId=curriculum123"
```

**Expected Response**: 400 Bad Request with message "Please pass a userId on the query string"

## Testing CreateCurriculum Function

### Endpoint
- **URL**: `POST /api/CreateCurriculum`
- **Authorization**: Anonymous

### Test Cases

#### 1. Create Curriculum with Auto-Generated ID
```bash
curl -X POST http://localhost:7071/api/CreateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "courseTitle": "Introduction to Programming",
    "status": "NotStarted",
    "nextReminderDate": "2024-01-20T09:00:00Z",
    "topics": []
  }'
```

**Expected Response**:
```json
{
  "id": "generated-guid-here",
  "userId": "user123",
  "courseTitle": "Introduction to Programming",
  "status": "NotStarted",
  "nextReminderDate": "2024-01-20T09:00:00Z",
  "topics": [],
  "partitionKey": "user123"
}
```

#### 2. Create Curriculum with Custom ID
```bash
curl -X POST http://localhost:7071/api/CreateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum456",
    "userId": "user123",
    "courseTitle": "Data Science Fundamentals",
    "status": "Active",
    "nextReminderDate": "2024-01-25T14:00:00Z",
    "topics": []
  }'
```

#### 3. Create Curriculum with Existing ID (Should Fail)
```bash
curl -X POST http://localhost:7071/api/CreateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum456",
    "userId": "user123",
    "courseTitle": "Another Course",
    "status": "NotStarted",
    "nextReminderDate": "2024-01-30T10:00:00Z",
    "topics": []
  }'
```

**Expected Response**: 400 Bad Request with message "Curriculum with ID 'curriculum456' already exists"

#### 4. Create Curriculum Missing Required Fields (Should Fail)
```bash
curl -X POST http://localhost:7071/api/CreateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "status": "NotStarted"
  }'
```

**Expected Response**: 400 Bad Request with message "CourseTitle is required"

#### 5. Create Curriculum with Topics
```bash
curl -X POST http://localhost:7071/api/CreateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "courseTitle": "Web Development",
    "status": "NotStarted",
    "nextReminderDate": "2024-02-01T09:00:00Z",
    "topics": [
      {
        "id": "topic1",
        "title": "HTML Basics",
        "description": "Learn HTML fundamentals",
        "estimatedTime": 3600,
        "question": "What are HTML tags?",
        "resources": ["https://developer.mozilla.org/en-US/docs/Web/HTML"],
        "status": "NotStarted"
      }
    ]
  }'
```

## Testing UpdateCurriculum Function

### Endpoint
- **URL**: `PUT /api/UpdateCurriculum`
- **Authorization**: Anonymous

### Test Cases

#### 1. Update Curriculum Course Title
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum123",
    "userId": "user123",
    "courseTitle": "Advanced Programming Concepts"
  }'
```

**Expected Response**:
```json
{
  "id": "curriculum123",
  "userId": "user123",
  "courseTitle": "Advanced Programming Concepts",
  "status": "Active",
  "nextReminderDate": "2024-01-15T10:00:00Z",
  "topics": [],
  "partitionKey": "user123"
}
```

#### 2. Update Curriculum Status
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum123",
    "userId": "user123",
    "status": "InProgress"
  }'
```

#### 3. Update Multiple Fields
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum123",
    "userId": "user123",
    "courseTitle": "Final Course Title",
    "status": "Completed",
    "nextReminderDate": "2024-02-15T10:00:00Z"
  }'
```

#### 4. Update Non-Existent Curriculum (Should Fail)
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "nonexistent",
    "userId": "user123",
    "courseTitle": "Test Course"
  }'
```

**Expected Response**: 404 Not Found with message "Curriculum with ID 'nonexistent' not found for user 'user123'"

#### 5. Update Curriculum Missing Id (Should Fail)
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "courseTitle": "Test Course"
  }'
```

**Expected Response**: 400 Bad Request with message "Id is required"

#### 6. Update Curriculum Missing UserId (Should Fail)
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum123",
    "courseTitle": "Test Course"
  }'
```

**Expected Response**: 400 Bad Request with message "UserId is required"

#### 7. Update Curriculum with No Changes
```bash
curl -X PUT http://localhost:7071/api/UpdateCurriculum \
  -H "Content-Type: application/json" \
  -d '{
    "id": "curriculum123",
    "userId": "user123",
    "courseTitle": "Final Course Title"
  }'
```

**Expected Response**: 200 OK with curriculum data (no changes detected)

## Verification in Cosmos DB

After running the tests, you can verify the data in your Cosmos DB:

1. Navigate to Azure Portal > Cosmos DB > daily-spark
2. Go to Data Explorer > curricula container
3. Query: `SELECT * FROM c` to see all curricula
4. Query: `SELECT * FROM c WHERE c.userId = 'user123'` to see curricula for specific user
5. Query: `SELECT * FROM c WHERE c.id = 'curriculum123'` to see specific curriculum

## Error Handling

All functions include comprehensive error handling:
- **400 Bad Request**: Invalid input data or missing required fields
- **404 Not Found**: Curriculum not found (GetCurriculum and UpdateCurriculum)
- **500 Internal Server Error**: Unexpected errors (logged for debugging)

## Logging

All operations are logged with appropriate log levels:
- Information: Successful operations
- Warning: Business logic warnings
- Error: Exceptions and errors

Check the function logs in Azure Portal or local console for debugging information.

## Important Notes

- **Partition Key**: Curricula use `userId` as the partition key for efficient querying
- **Security**: GetCurriculum and UpdateCurriculum require both `curriculumId` and `userId` for data isolation
- **Performance**: Queries use the correct partition key (`userId`) for optimal Cosmos DB performance
- **Topics**: Topics are stored as embedded documents within each curriculum
- **Status Updates**: Curriculum status can be updated independently of other fields
- **Date Handling**: NextReminderDate is stored as ISO 8601 format
- **Validation**: Only provided fields are updated in UpdateCurriculum operations
