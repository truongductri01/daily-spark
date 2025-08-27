# Daily Spark
> Your Partner in Daily Learning

`Daily Spark` is a personal learning assistant that helps you stay consistent and achieve your goals by:

- Creating structured learning curricula for any problem or project you want to solve
- Sending daily reminders with your learning topics to keep you on track
- Tracking your progress and celebrating your milestones along the way

## 🏗️ Architecture Overview

This project is built using **Azure Durable Functions** with the **Azure Functions Worker** runtime, providing a scalable and reliable way to process learning curricula for multiple users in parallel.

### Core Components

#### 1. **Orchestrator Functions**
- **`ProcessAllUsersOrchestrator`**: Main orchestration that processes all users in parallel
  - Retrieves all user IDs from Cosmos DB
  - Executes curriculum processing for each user concurrently
  - Collects and returns results from all activities

#### 2. **Activity Functions**
- **`GetAllUserIdsActivity`**: Retrieves all user IDs from the users container
- **`ProcessUserCurriculumTopicsActivity`**: Processes curriculum topics for a single user
  - Queries user information
  - Retrieves active curriculum topics
  - Sends email notifications
  - Returns structured response

#### 3. **Client Functions**
- **`StartProcessAllUsersClient`**: HTTP trigger to start the orchestration process
  - Accepts POST/GET requests
  - Initiates the orchestration
  - Returns status check endpoints

#### 4. **Legacy Functions**
- **`QueryCurriculumTopicsByUserId`**: Direct HTTP endpoint for single user processing (maintained for backward compatibility)

### Design Patterns

#### **Fan-Out/Fan-In Pattern**
The orchestrator uses the fan-out/fan-in pattern to process multiple users efficiently:
1. **Fan-Out**: Start multiple activity functions in parallel
2. **Fan-In**: Wait for all activities to complete and collect results

#### **Reusable Service Layer**
- **`UserCurriculumService`**: Centralized business logic for curriculum processing
  - Used by both the activity function and legacy HTTP function
  - Handles Cosmos DB operations, email sending, and response building
  - Promotes code reuse and maintainability

## 🚀 Local Development Setup

### Prerequisites
- .NET 8.0 SDK
- Azure Functions Core Tools v4
- Azurite (for local Azure Storage emulation)
- Visual Studio Code or Visual Studio

### 1. **Install Dependencies**
```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Install .NET 8.0 SDK
# Download from: https://dotnet.microsoft.com/download/dotnet/8.0
```

### 2. **Configure Local Settings**
Create/update `daily-spark-function/local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "COSMOS_DB_ACCOUNT_ENDPOINT": "https://daily-spark-cosmos.documents.azure.com:443/",
    "COSMOS_DB_API_KEY": "<your-cosmos-db-api-key>",
    "COSMOS_DB_DATABASE_ID": "daily-spark",
    "COSMOS_DB_USER_CONTAINER_ID": "users",
    "COSMOS_DB_CURRICULUM_CONTAINER_ID": "curricula",
    "USER_COUNTER_DOCUMENT_ID": "user-counter",
    "MAX_USERS_LIMIT": "100",
    "DEMO_USER_ID": "first-user"
  }
}
```

### 3. **Start Azurite (Local Azure Storage)**
```bash
# Create azurite folder
mkdir azuriteFolder

# Start Azurite with debug logging
azurite --location ./azuriteFolder --debug ./azuriteFolder/debug.log

# Keep this running in a separate terminal
```

### 4. **Run the Function App**
```bash
cd daily-spark-function

# Restore packages and build
dotnet restore
dotnet build

# Start the function app
func start
```

The function app will be available at `http://localhost:7071`

## 🧪 Testing Your Functions

### 1. **Test Individual Functions**

#### **Start Orchestration**
```bash
# Start the orchestration process
curl -X POST http://localhost:7071/api/StartProcessAllUsersClient
```

#### **Query Single User (Legacy)**
```bash
# Test the legacy single-user endpoint
curl "http://localhost:7071/api/QueryCurriculumTopicsByUserId?userId=<your-user-id>"
```

### 2. **Monitor Orchestration**
After starting the orchestration, you'll receive a response with status check endpoints:
```json
{
  "statusQueryGetUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/<instance-id>?taskHub=TestHubName&connection=Storage&code=<code>",
  "terminatePostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/<instance-id>/terminate?taskHub=TestHubName&connection=Storage&code=<code>",
  "purgeDeleteUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/<instance-id>?taskHub=TestHubName&connection=Storage&code=<code>",
  "sendEventPostUri": "http://localhost:7071/runtime/webhooks/durabletask/instances/<instance-id>/raiseEvent/{eventName}?taskHub=TestHubName&connection=Storage&code=<code>"
}
```

#### **Check Orchestration Status**
```bash
# Get the current status
curl "http://localhost:7071/runtime/webhooks/durabletask/instances/<instance-id>?taskHub=TestHubName&connection=Storage&code=<code>"
```

### 3. **View Function Logs**
Monitor the function execution in your terminal where `func start` is running. You'll see:
- Orchestration start/completion logs
- Activity function execution logs
- User processing progress
- Email sending confirmations

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|-----------|-------------|----------|
| `COSMOS_DB_ACCOUNT_ENDPOINT` | Cosmos DB account endpoint URL | Yes |
| `COSMOS_DB_API_KEY` | Cosmos DB access key | Yes |
| `COSMOS_DB_DATABASE_ID` | Database name | Yes |
| `COSMOS_DB_USER_CONTAINER_ID` | Users container name | Yes |
| `COSMOS_DB_CURRICULUM_CONTAINER_ID` | Curricula container name | Yes |
| `USER_COUNTER_DOCUMENT_ID` | User counter document ID | No (default: "user-counter") |
| `MAX_USERS_LIMIT` | Maximum number of users allowed | No (default: 100) |
| `DEMO_USER_ID` | Demo user ID for readonly access | No (default: "first-user") |

### Cosmos DB Configuration
- **Database**: `daily-spark`
- **Containers**: `users`, `curricula`
- **Partition Key**: `/PartitionKey` (same as userId)

### User Counter System
The system uses an efficient counter document to track the total number of users:

- **Counter Document**: Stored in the `users` container with ID `user-counter`
- **Performance**: O(1) operations instead of O(n) COUNT queries
- **Auto-Initialization**: Counter document created automatically if missing
- **User Limit**: Configurable limit (default: 100 users) enforced on user creation

#### **User Counter Endpoints**
```bash
# Get current user count
GET /api/GetUserCount
Response: { "totalUsers": 42 }

# Create user (with limit check)
POST /api/CreateUser
Body: { "email": "user@example.com", "displayName": "User Name" }
```

## 📊 Function Execution Flow

```
HTTP Request → StartProcessAllUsersClient
                    ↓
            ProcessAllUsersOrchestrator
                    ↓
            GetAllUserIdsActivity (Get all user IDs)
                    ↓
            ProcessUserCurriculumTopicsActivity (Parallel execution for each user)
                    ↓
            UserCurriculumService (Business logic)
                    ↓
            Return aggregated results
```

## 🚨 Troubleshooting

### Common Issues

#### **Function Discovery Errors**
- Ensure all function classes have `[Function]` attributes
- Check that classes are `public`
- Verify namespace matches project structure

#### **Cosmos DB Connection Issues**
- Verify environment variables are set correctly
- Check network connectivity to Cosmos DB
- Ensure API key has proper permissions

#### **Azurite Connection Issues**
- Make sure Azurite is running before starting functions
- Check that `AzureWebJobsStorage` is set to `UseDevelopmentStorage=true`
- Restart function app after Azurite changes

#### **Parallel Execution Issues**
- Monitor function logs for individual activity failures
- Check Cosmos DB RU consumption during parallel execution
- Consider implementing retry policies for failed activities

### Debug Tips
1. **Enable Detailed Logging**: Check function logs for step-by-step execution
2. **Monitor Azurite**: Check `azuriteFolder/debug.log` for storage operations
3. **Use Status Endpoints**: Monitor orchestration progress via status check URLs
4. **Test Incrementally**: Start with single user processing before testing orchestration

## 📚 Additional Resources

- [Azure Durable Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/durable/)
- [Azure Functions Worker Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide)
- [Cosmos DB .NET SDK](https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-dotnet-standard-sdk)
- [Azurite Documentation](https://github.com/Azure/Azurite)

---

## 📐 UI & Email Styling Reference
For details on the color palette, typography, card layout, and HTML structure used in Daily Spark's UI and emails, see the [Styling Design Doc](daily-spark-function/Testing/design.md).