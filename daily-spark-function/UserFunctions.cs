using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using DailySpark.Functions.Model;
using DailySpark.Functions.Helpers;
using System.Text.Json;

// Use aliases to avoid ambiguity
using UserModel = DailySpark.Functions.Model.User;
using UserResponseModel = DailySpark.Functions.Model.UserResponse;

namespace DailySpark.Functions;

#region User Functions

public class CreateUser
{
    private readonly ILogger<CreateUser> _logger;

    public CreateUser(ILogger<CreateUser> logger)
    {
        _logger = logger;
    }

    [Function("CreateUser")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a create user request.");

        try
        {
            // Parse request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                return new BadRequestObjectResult("Request body is required");
            }

            CreateUserRequest? requestData = JsonSerializer.Deserialize<CreateUserRequest>(requestBody);
            if (requestData == null)
            {
                return new BadRequestObjectResult("Invalid request format");
            }

            // Validate required fields
            if (string.IsNullOrEmpty(requestData.Email))
            {
                return new BadRequestObjectResult("Email is required");
            }

            if (string.IsNullOrEmpty(requestData.DisplayName))
            {
                return new BadRequestObjectResult("DisplayName is required");
            }

            // Get Cosmos DB container
            Container usersContainer = UserFunctionHelpers.GetUsersContainer();

            // Check user limit before creating new user
            string maxUsersLimitStr = Environment.GetEnvironmentVariable("MAX_USERS_LIMIT") ?? "100";
            if (!int.TryParse(maxUsersLimitStr, out int maxUsersLimit))
            {
                maxUsersLimit = 100; // Default fallback
            }

            int currentUserCount = await UserFunctionHelpers.GetUserCountAsync(usersContainer, _logger);
            if (currentUserCount >= maxUsersLimit)
            {
                return new BadRequestObjectResult($"User limit reached. Maximum allowed users: {maxUsersLimit}. Current users: {currentUserCount}");
            }

            // Check if user with provided ID already exists (if ID was provided)
            if (!string.IsNullOrEmpty(requestData.Id))
            {
                bool userExists = await UserFunctionHelpers.CheckUserExistsAsync(usersContainer, requestData.Id, _logger);
                if (userExists)
                {
                    return new BadRequestObjectResult($"User with ID '{requestData.Id}' already exists");
                }
            }

            // Generate user ID if not provided
            string userId = requestData.Id ?? Guid.NewGuid().ToString();

            // Create user record
            UserModel user = new UserModel
            {
                Id = userId,
                Email = requestData.Email,
                DisplayName = requestData.DisplayName,
                PartitionKey = userId
            };

            // Save to Cosmos DB
            await usersContainer.CreateItemAsync(user, new PartitionKey(userId));

            // Increment user counter
            int newUserCount = await UserFunctionHelpers.IncrementUserCounterAsync(usersContainer, _logger);

            _logger.LogInformation($"Successfully created user with ID: {userId}. Total users: {newUserCount}");

            return new OkObjectResult(new UserResponseModel
            {
                Id = userId,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PartitionKey = user.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return new StatusCodeResult(500);
        }
    }
}

public class GetUser
{
    private readonly ILogger<GetUser> _logger;

    public GetUser(ILogger<GetUser> logger)
    {
        _logger = logger;
    }

    [Function("GetUser")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a get user request.");

        try
        {
            // Get userId from query parameters
            string? userId = req.Query["userId"];
            if (string.IsNullOrEmpty(userId))
            {
                return new BadRequestObjectResult("Please pass a userId on the query string");
            }

            // Get Cosmos DB container
            Container usersContainer = UserFunctionHelpers.GetUsersContainer();

            // Get user by ID
            UserModel? user = await UserFunctionHelpers.GetUserByIdAsync(usersContainer, userId, _logger);
            if (user == null)
            {
                return new NotFoundObjectResult($"User with ID '{userId}' not found");
            }

            _logger.LogInformation($"Successfully retrieved user with ID: {userId}");

            return new OkObjectResult(new UserResponseModel
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PartitionKey = user.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user");
            return new StatusCodeResult(500);
        }
    }
}

public class UpdateUser
{
    private readonly ILogger<UpdateUser> _logger;

    public UpdateUser(ILogger<UpdateUser> logger)
    {
        _logger = logger;
    }

    [Function("UpdateUser")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "put")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed an update user request.");

        try
        {
            // Parse request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                return new BadRequestObjectResult("Request body is required");
            }

            UpdateUserRequest? requestData = JsonSerializer.Deserialize<UpdateUserRequest>(requestBody);
            if (requestData == null)
            {
                return new BadRequestObjectResult("Invalid request format");
            }

            // Validate required fields
            if (string.IsNullOrEmpty(requestData.Id))
            {
                return new BadRequestObjectResult("Id is required");
            }

            // Get Cosmos DB container
            Container usersContainer = UserFunctionHelpers.GetUsersContainer();

            // Check if user exists
            UserModel? existingUser = await UserFunctionHelpers.GetUserByIdAsync(usersContainer, requestData.Id, _logger);
            if (existingUser == null)
            {
                return new NotFoundObjectResult($"User with ID '{requestData.Id}' not found");
            }

            // Update user fields if provided
            bool hasChanges = false;
            if (!string.IsNullOrEmpty(requestData.Email) && requestData.Email != existingUser.Email)
            {
                existingUser.Email = requestData.Email;
                hasChanges = true;
            }

            if (!string.IsNullOrEmpty(requestData.DisplayName) && requestData.DisplayName != existingUser.DisplayName)
            {
                existingUser.DisplayName = requestData.DisplayName;
                hasChanges = true;
            }

            if (!hasChanges)
            {
                return new OkObjectResult(new UserResponseModel
                {
                    Id = existingUser.Id,
                    Email = existingUser.Email,
                    DisplayName = existingUser.DisplayName,
                    PartitionKey = existingUser.PartitionKey
                });
            }

            // Save updated user to Cosmos DB
            await usersContainer.ReplaceItemAsync(existingUser, existingUser.Id, new PartitionKey(existingUser.Id));

            _logger.LogInformation($"Successfully updated user with ID: {existingUser.Id}");

            return new OkObjectResult(new UserResponseModel
            {
                Id = existingUser.Id,
                Email = existingUser.Email,
                DisplayName = existingUser.DisplayName,
                PartitionKey = existingUser.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user");
            return new StatusCodeResult(500);
        }
    }
}

public class GetUserCount
{
    private readonly ILogger<GetUserCount> _logger;

    public GetUserCount(ILogger<GetUserCount> logger)
    {
        _logger = logger;
    }

    [Function("GetUserCount")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a get user count request.");

        try
        {
            // Get Cosmos DB container
            Container usersContainer = UserFunctionHelpers.GetUsersContainer();

            // Get user count from counter document
            int userCount = await UserFunctionHelpers.GetUserCountAsync(usersContainer, _logger);

            _logger.LogInformation($"Successfully retrieved user count: {userCount}");

            return new OkObjectResult(new { totalUsers = userCount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user count");
            return new StatusCodeResult(500);
        }
    }
}

#endregion
