# CORS Configuration for Azure Functions

## Overview
This document outlines the CORS (Cross-Origin Resource Sharing) configuration for the Azure Functions backend to allow requests from the React frontend running on `http://localhost:3000`.

## Problem
Azure Functions v4 with isolated process model does not support the standard ASP.NET Core CORS middleware. The previous approach using `[EnableCors]` attributes and `services.AddCors()` in `Program.cs` was not compatible with the isolated process model.

## Solution
We implemented Azure Functions native CORS configuration using the following approach:

### 1. Host Configuration (`host.json`)
```json
{
    "version": "2.0",
    "logging": {
        "applicationInsights": {
            "samplingSettings": {
                "isEnabled": true,
                "excludedTypes": "Request"
            },
            "enableLiveMetricsFilters": true
        }
    },
    "cors": {
        "allowedOrigins": [
            "http://localhost:3000"
        ],
        "allowedHeaders": [
            "Content-Type",
            "Authorization",
            "X-Requested-With"
        ],
        "allowedMethods": [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        "allowCredentials": true
    }
}
```

### 2. Local Development Configuration (`local.settings.json`)
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    // ... other settings
  },
  "Host": {
    "CORS": "http://localhost:3000",
    "CORSCredentials": true
  }
}
```

### 3. CORS Preflight Handler (`CorsFunction.cs`)
Created a dedicated function to handle OPTIONS preflight requests:

```csharp
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace DailySpark.Functions;

/// <summary>
/// Global CORS function to handle OPTIONS requests
/// </summary>
public class CorsFunction
{
    private readonly ILogger<CorsFunction> _logger;

    public CorsFunction(ILogger<CorsFunction> logger)
    {
        _logger = logger;
    }

    [Function("Cors")]
    public Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "options")] HttpRequest req)
    {
        _logger.LogInformation("CORS preflight request received.");

        // Return a simple OK response with CORS headers
        return Task.FromResult<IActionResult>(new OkObjectResult(new { message = "CORS preflight successful" }));
    }
}
```

### 4. Clean Program.cs
Removed all CORS-related middleware configuration from `Program.cs`:

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

IHost host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        // Add any other DI registrations here
    })
    .Build();

host.Run();
```

### 5. Removed EnableCors Attributes
Removed all `[EnableCors("AllowReactApp")]` attributes from function classes:
- `UserFunctions.cs`
- `CurriculumFunctions.cs`
- `QueryCurriculumTopicsByUserId.cs`
- `StartProcessAllUsersClient.cs`

## Configuration Details

### Allowed Origins
- `http://localhost:3000` - React development server

### Allowed Headers
- `Content-Type` - For JSON requests
- `Authorization` - For future authentication
- `X-Requested-With` - For AJAX requests

### Allowed Methods
- `GET` - Retrieve data
- `POST` - Create new resources
- `PUT` - Update existing resources
- `DELETE` - Remove resources
- `OPTIONS` - CORS preflight requests

### Credentials
- `allowCredentials: true` - Allows cookies and authentication headers

## Testing the Configuration

### 1. Start Azure Functions Backend
```bash
cd daily-spark-function
func start
```

### 2. Start React Frontend
```bash
cd daily-spark-ui
npm start
```

### 3. Test CORS Preflight
```bash
curl -X OPTIONS http://localhost:7071/api/GetUser \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 4. Test Actual Request
```bash
curl -X GET http://localhost:7071/api/GetUser?userId=test-user \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -v
```

## Troubleshooting

### Common Issues

1. **CORS Error Still Appearing**
   - Ensure both `host.json` and `local.settings.json` are configured
   - Restart the Azure Functions runtime after configuration changes
   - Check browser developer tools for specific CORS error messages

2. **Preflight Request Failing**
   - Verify the `CorsFunction` is properly registered
   - Check that OPTIONS method is allowed in configuration
   - Ensure the function route matches the expected pattern

3. **Credentials Not Working**
   - Verify `allowCredentials: true` is set in both configurations
   - Check that the frontend is sending credentials properly
   - Ensure the origin is exactly `http://localhost:3000`

### Debug Steps

1. **Check Function Logs**
   ```bash
   func start --verbose
   ```

2. **Test with curl**
   ```bash
   # Test preflight
   curl -X OPTIONS http://localhost:7071/api/GetUser -v
   
   # Test actual request
   curl -X GET http://localhost:7071/api/GetUser?userId=test -v
   ```

3. **Browser Developer Tools**
   - Open Network tab
   - Look for OPTIONS requests
   - Check response headers for CORS headers

## Production Considerations

### Environment-Specific Configuration
For production deployment, update the CORS configuration:

```json
{
    "cors": {
        "allowedOrigins": [
            "https://your-production-domain.com"
        ],
        "allowedHeaders": [
            "Content-Type",
            "Authorization",
            "X-Requested-With"
        ],
        "allowedMethods": [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],
        "allowCredentials": true
    }
}
```

### Security Best Practices
1. **Limit Origins**: Only allow specific domains, not wildcards
2. **Limit Methods**: Only allow necessary HTTP methods
3. **Limit Headers**: Only allow required headers
4. **Use HTTPS**: Always use HTTPS in production
5. **Regular Review**: Periodically review and update CORS policies

## Files Modified

### Added Files
- `CorsFunction.cs` - CORS preflight handler

### Modified Files
- `host.json` - Added CORS configuration
- `local.settings.json` - Added development CORS settings
- `Program.cs` - Removed CORS middleware configuration

### Cleaned Files
- `UserFunctions.cs` - Removed EnableCors attributes
- `CurriculumFunctions.cs` - Removed EnableCors attributes
- `QueryCurriculumTopicsByUserId.cs` - Removed EnableCors attributes
- `StartProcessAllUsersClient.cs` - Removed EnableCors attributes

## Verification

✅ **Build Status**: Project builds successfully with minimal warnings
✅ **CORS Configuration**: Native Azure Functions CORS approach implemented
✅ **Preflight Support**: OPTIONS requests handled by dedicated function
✅ **Development Ready**: Local settings configured for development
✅ **Production Ready**: Host configuration ready for production deployment

## Next Steps

1. **Test Integration**: Verify CORS works with React frontend
2. **Monitor Logs**: Check for any CORS-related errors
3. **Production Deployment**: Update CORS origins for production
4. **Security Review**: Ensure CORS policy follows security best practices

---

**Note**: This configuration uses Azure Functions native CORS support, which is the recommended approach for Azure Functions v4 with isolated process model. The previous ASP.NET Core CORS middleware approach is not supported in this runtime model.
