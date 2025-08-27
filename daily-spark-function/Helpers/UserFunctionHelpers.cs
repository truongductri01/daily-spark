using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

// Use alias to avoid ambiguity
using UserModel = DailySpark.Functions.Model.User;
using UserCounterModel = DailySpark.Functions.Model.UserCounter;

namespace DailySpark.Functions.Helpers;

public static class UserFunctionHelpers
{
    public static Container GetUsersContainer()
    {
        string? cosmosDbAccountEndpoint = Environment.GetEnvironmentVariable("COSMOS_DB_ACCOUNT_ENDPOINT");
        string? apiKey = Environment.GetEnvironmentVariable("COSMOS_DB_API_KEY");
        string? databaseId = Environment.GetEnvironmentVariable("COSMOS_DB_DATABASE_ID");
        string? userContainerId = Environment.GetEnvironmentVariable("COSMOS_DB_USER_CONTAINER_ID");

        if (string.IsNullOrEmpty(cosmosDbAccountEndpoint) || string.IsNullOrEmpty(apiKey) ||
            string.IsNullOrEmpty(databaseId) || string.IsNullOrEmpty(userContainerId))
        {
            throw new InvalidOperationException("Cosmos DB configuration is missing.");
        }

        CosmosClient cosmosClient = new CosmosClient(cosmosDbAccountEndpoint, apiKey);
        Database database = cosmosClient.GetDatabase(databaseId);
        return database.GetContainer(userContainerId);
    }

    public static async Task<bool> CheckUserExistsAsync(Container container, string userId, ILogger logger)
    {
        try
        {
            string query = "SELECT VALUE COUNT(1) FROM c WHERE c.id = @userId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@userId", userId);

            FeedIterator<int> iterator = container.GetItemQueryIterator<int>(queryDefinition);
            FeedResponse<int> response = await iterator.ReadNextAsync();

            return response.FirstOrDefault() > 0;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error checking if user exists: {userId}");
            throw;
        }
    }

    public static async Task<UserModel?> GetUserByIdAsync(Container container, string userId, ILogger logger)
    {
        try
        {
            string query = "SELECT * FROM c WHERE c.id = @userId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@userId", userId);

            FeedIterator<UserModel> iterator = container.GetItemQueryIterator<UserModel>(
                queryDefinition,
                requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) }
            );

            if (!iterator.HasMoreResults)
            {
                return null;
            }

            FeedResponse<UserModel> response = await iterator.ReadNextAsync();
            return response.FirstOrDefault();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error getting user by ID: {userId}");
            throw;
        }
    }

    public static async Task<UserCounterModel?> GetUserCounterAsync(Container container, ILogger logger)
    {
        try
        {
            string counterId = Environment.GetEnvironmentVariable("USER_COUNTER_DOCUMENT_ID") ?? "user-counter";

            string query = "SELECT * FROM c WHERE c.id = @counterId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@counterId", counterId);

            FeedIterator<UserCounterModel> iterator = container.GetItemQueryIterator<UserCounterModel>(queryDefinition);

            if (!iterator.HasMoreResults)
            {
                return null;
            }

            FeedResponse<UserCounterModel> response = await iterator.ReadNextAsync();
            return response.FirstOrDefault();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user counter");
            throw;
        }
    }

    public static async Task<UserCounterModel> InitializeUserCounterAsync(Container container, ILogger logger)
    {
        try
        {
            string counterId = Environment.GetEnvironmentVariable("USER_COUNTER_DOCUMENT_ID") ?? "user-counter";

            // First, try to get existing counter
            UserCounterModel? existingCounter = await GetUserCounterAsync(container, logger);
            if (existingCounter != null)
            {
                return existingCounter;
            }

            // If counter doesn't exist, create it
            UserCounterModel newCounter = new UserCounterModel
            {
                Id = counterId,
                TotalUsers = 0,
                LastUpdated = DateTime.UtcNow,
                PartitionKey = counterId
            };

            await container.CreateItemAsync(newCounter, new PartitionKey(counterId));
            logger.LogInformation($"Initialized user counter with ID: {counterId}");

            return newCounter;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error initializing user counter");
            throw;
        }
    }

    public static async Task<int> IncrementUserCounterAsync(Container container, ILogger logger)
    {
        try
        {
            string counterId = Environment.GetEnvironmentVariable("USER_COUNTER_DOCUMENT_ID") ?? "user-counter";

            // Get current counter
            UserCounterModel counter = await InitializeUserCounterAsync(container, logger);

            // Increment the count
            counter.TotalUsers++;
            counter.LastUpdated = DateTime.UtcNow;

            // Update the counter document
            await container.ReplaceItemAsync(counter, counterId, new PartitionKey(counterId));

            logger.LogInformation($"Incremented user counter to: {counter.TotalUsers}");
            return counter.TotalUsers;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error incrementing user counter");
            throw;
        }
    }

    public static async Task<int> GetUserCountAsync(Container container, ILogger logger)
    {
        try
        {
            UserCounterModel counter = await InitializeUserCounterAsync(container, logger);
            return counter.TotalUsers;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user count");
            throw;
        }
    }
}
