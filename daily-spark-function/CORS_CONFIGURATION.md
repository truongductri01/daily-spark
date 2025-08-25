# CORS Configuration for Azure Functions

## Overview
This document describes the CORS (Cross-Origin Resource Sharing) configuration added to the Azure Functions backend to allow requests from the React frontend running on `localhost:3000`.

## Changes Made

### 1. Program.cs - CORS Service Configuration
Added CORS services to the dependency injection container:

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### 2. Function Files - CORS Attributes
Added `[EnableCors("AllowReactApp")]` attributes to all HTTP trigger functions:

#### UserFunctions.cs
- `CreateUser` function
- `GetUser` function  
- `UpdateUser` function

#### CurriculumFunctions.cs
- `GetCurriculaByUserId` function
- `GetCurriculum` function
- `CreateCurriculum` function
- `UpdateCurriculum` function

#### QueryCurriculumTopicsByUserId.cs
- `QueryCurriculumTopicsByUserId` function

#### StartProcessAllUsersClient.cs
- `StartProcessAllUsersClient` function

## CORS Policy Details

The CORS policy `"AllowReactApp"` allows:
- **Origin**: `http://localhost:3000` (React development server)
- **Headers**: Any headers
- **Methods**: Any HTTP methods (GET, POST, PUT, DELETE)
- **Credentials**: Allows credentials (cookies, authorization headers)

## Testing the Configuration

### 1. Start Azure Functions
```bash
cd daily-spark-function
func start
```

### 2. Start React Frontend
```bash
cd daily-spark-ui
npm start
```

### 3. Test API Calls
Open the browser developer tools and check the Network tab. API calls should now:
- Go to `http://localhost:7071/api/*` (correct backend)
- Not show CORS errors
- Return proper responses

### 4. Verify in Browser Console
You should see:
- API configuration logs showing correct base URL
- Successful API requests without CORS errors
- Proper responses from the Azure Functions backend

## Troubleshooting

### If CORS errors persist:
1. **Check Azure Functions is running**: Ensure `func start` is running on port 7071
2. **Check React app URL**: Ensure React is running on `http://localhost:3000`
3. **Clear browser cache**: Hard refresh (Ctrl+F5) to clear cached CORS preflight responses
4. **Check function logs**: Look at Azure Functions console output for any errors

### Common Issues:
- **Port conflicts**: Ensure port 7071 is available for Azure Functions
- **Function not found**: Check that all functions are properly deployed
- **Authentication issues**: Ensure functions have `AuthorizationLevel.Anonymous` for testing

## Production Considerations

For production deployment:
1. **Update CORS origins**: Replace `http://localhost:3000` with your production domain
2. **Restrict methods**: Only allow necessary HTTP methods
3. **Security headers**: Add additional security headers as needed
4. **Environment-specific config**: Use different CORS policies for different environments

## Files Modified

- `Program.cs` - Added CORS service configuration
- `UserFunctions.cs` - Added CORS attributes to user functions
- `CurriculumFunctions.cs` - Added CORS attributes to curriculum functions  
- `QueryCurriculumTopicsByUserId.cs` - Added CORS attribute
- `StartProcessAllUsersClient.cs` - Added CORS attribute

## Build Status

✅ **Build Successful**: All CORS changes compile without errors
⚠️ **Warnings**: Some durable function warnings (unrelated to CORS)
✅ **Ready for Testing**: CORS configuration is complete and ready for testing
