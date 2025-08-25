# Environment Setup Guide

## Local Development Configuration

To run the application with Azure Functions integration, you need to set up environment variables.

### 1. Create Environment File

Create a `.env.local` file in the `daily-spark-ui` directory with the following content:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:7071/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_API_RETRY_ATTEMPTS=3
REACT_APP_API_RETRY_DELAY=1000

# Environment
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_LOGGING=true

# Azure Functions Development Settings
# These match the local.settings.json from the Azure Functions project
REACT_APP_COSMOS_DB_ACCOUNT_ENDPOINT=https://daily-spark-cosmos.documents.azure.com:443/
REACT_APP_COSMOS_DB_DATABASE_ID=daily-spark
REACT_APP_COSMOS_DB_USER_CONTAINER_ID=users
REACT_APP_COSMOS_DB_CURRICULUM_CONTAINER_ID=curricula
```

### 2. Azure Functions Setup

Make sure your Azure Functions project is running locally:

1. Navigate to the `daily-spark-function` directory
2. Run `func start` or use Visual Studio Code Azure Functions extension
3. The functions should be available at `http://localhost:7071/api`

### 3. Environment Variables Explained

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `REACT_APP_API_BASE_URL` | Base URL for Azure Functions API | `http://localhost:7071/api` |
| `REACT_APP_API_TIMEOUT` | Request timeout in milliseconds | `10000` |
| `REACT_APP_API_RETRY_ATTEMPTS` | Number of retry attempts for failed requests | `3` |
| `REACT_APP_API_RETRY_DELAY` | Delay between retry attempts in milliseconds | `1000` |
| `REACT_APP_ENVIRONMENT` | Current environment (development/production) | `development` |
| `REACT_APP_ENABLE_LOGGING` | Enable API call logging | `true` |

### 4. Production Configuration

For production deployment, update the environment variables:

```bash
REACT_APP_API_BASE_URL=https://your-azure-functions-app.azurewebsites.net/api
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_LOGGING=false
```

### 5. Verification

After setting up the environment:

1. Start the React development server: `npm start`
2. Check the browser console for API configuration logs
3. Verify that the API base URL is correctly set
4. Test API connectivity by attempting to load user data

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Azure Functions CORS is configured to allow requests from `http://localhost:3000`
2. **Connection Refused**: Verify Azure Functions are running on port 7071
3. **Environment Variables Not Loading**: Restart the React development server after creating `.env.local`

### Azure Functions CORS Configuration

Add the following to your Azure Functions `host.json`:

```json
{
  "version": "2.0",
  "cors": {
    "allowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com"
    ],
    "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "allowedHeaders": ["*"]
  }
}
```
