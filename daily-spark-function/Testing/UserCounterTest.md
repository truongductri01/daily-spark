# User Counter System Test Guide

## Overview
This guide helps you test the new user counter system that efficiently tracks the total number of users.

## Prerequisites
1. Azure Functions running locally (`func start`)
2. Cosmos DB connection configured
3. Azurite running for local storage

## Test Scenarios

### 1. Get User Count (Empty System)
**Test**: Get user count when no users exist
```bash
curl "http://localhost:7071/api/GetUserCount"
```

**Expected Response**:
```json
{
  "totalUsers": 0
}
```

**What Happens**:
- Counter document is automatically created with `totalUsers: 0`
- Log: `"Initialized user counter with ID: user-counter"`

### 2. Create First User
**Test**: Create a user and verify counter increments
```bash
curl -X POST "http://localhost:7071/api/CreateUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "displayName": "Test User 1"
  }'
```

**Expected Response**:
```json
{
  "id": "generated-guid",
  "email": "test1@example.com",
  "displayName": "Test User 1",
  "partitionKey": "generated-guid"
}
```

**Verify Counter**:
```bash
curl "http://localhost:7071/api/GetUserCount"
```

**Expected Response**:
```json
{
  "totalUsers": 1
}
```

### 3. Create Multiple Users
**Test**: Create several users and verify counter accuracy
```bash
# Create user 2
curl -X POST "http://localhost:7071/api/CreateUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "displayName": "Test User 2"
  }'

# Create user 3
curl -X POST "http://localhost:7071/api/CreateUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "displayName": "Test User 3"
  }'

# Check counter
curl "http://localhost:7071/api/GetUserCount"
```

**Expected Response**:
```json
{
  "totalUsers": 3
}
```

### 4. User Limit Test
**Test**: Verify user limit enforcement (set to 100 by default)

**Option A: Test with Lower Limit**
Temporarily change `MAX_USERS_LIMIT` to `3` in `local.settings.json`:
```json
"MAX_USERS_LIMIT": "3"
```

Then try to create a 4th user:
```bash
curl -X POST "http://localhost:7071/api/CreateUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test4@example.com",
    "displayName": "Test User 4"
  }'
```

**Expected Response**:
```json
{
  "error": "User limit reached. Maximum allowed users: 3. Current users: 3"
}
```

**Option B: Test with Higher Limit**
For testing with higher limits, you can temporarily increase the limit:
```json
"MAX_USERS_LIMIT": "1000"
```

### 5. Counter Document Inspection
**Test**: Verify the counter document structure in Cosmos DB

Using Azure Data Explorer or Cosmos DB Explorer, query:
```sql
SELECT * FROM c WHERE c.id = "user-counter"
```

**Expected Document**:
```json
{
  "id": "user-counter",
  "totalUsers": 3,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "PartitionKey": "user-counter"
}
```

### 6. Error Handling Test
**Test**: Verify system handles missing counter document

**Manual Test**:
1. Delete the counter document from Cosmos DB
2. Call `GET /api/GetUserCount`
3. Verify counter is recreated with correct count

**Expected Behavior**:
- Counter document is automatically recreated
- Count reflects actual number of users in system
- Log: `"Initialized user counter with ID: user-counter"`

## Performance Testing

### Response Time Test
**Test**: Measure response time of user count endpoint
```bash
time curl "http://localhost:7071/api/GetUserCount"
```

**Expected**: Sub-100ms response time

### Concurrent Access Test
**Test**: Multiple simultaneous requests
```bash
# Run multiple requests in parallel
for i in {1..10}; do
  curl "http://localhost:7071/api/GetUserCount" &
done
wait
```

**Expected**: All requests return same count, no errors

## Configuration Testing

### Custom Counter ID
**Test**: Verify custom counter document ID works
```json
"USER_COUNTER_DOCUMENT_ID": "custom-counter-id"
```

**Expected**: Counter document created with custom ID

### Custom User Limit
**Test**: Verify custom user limit works
```json
"MAX_USERS_LIMIT": "50"
```

**Expected**: User creation blocked at 50 users

## Troubleshooting

### Common Issues

1. **Counter Always Returns 0**
   - Check if counter document exists in Cosmos DB
   - Verify partition key matches document ID
   - Check function logs for initialization errors

2. **User Creation Fails**
   - Verify `MAX_USERS_LIMIT` is set correctly
   - Check if counter document is accessible
   - Review function logs for detailed error messages

3. **Performance Issues**
   - Verify Cosmos DB connection is healthy
   - Check RU consumption in Azure Portal
   - Monitor function execution logs

### Debug Commands

**Check Function Logs**:
```bash
# In the terminal running func start
# Look for user counter related log messages
```

**Verify Environment Variables**:
```bash
# Check if configuration is loaded correctly
# Look for USER_COUNTER_DOCUMENT_ID and MAX_USERS_LIMIT in logs
```

**Test Cosmos DB Connection**:
```bash
# Try a simple query to verify connection
curl "http://localhost:7071/api/GetUser?userId=test-user"
```

## Success Criteria

✅ **Counter Initialization**: Counter document created automatically
✅ **Accurate Counting**: Counter matches actual user count
✅ **Limit Enforcement**: User creation blocked at limit
✅ **Error Handling**: Graceful handling of missing counter
✅ **Performance**: Sub-100ms response times
✅ **Configuration**: Environment variables work correctly
✅ **Logging**: Comprehensive logging for debugging

## Next Steps

After successful testing:
1. Deploy to production environment
2. Update frontend to use new `/api/GetUserCount` endpoint
3. Monitor performance and accuracy in production
4. Set up alerts for approaching user limits
