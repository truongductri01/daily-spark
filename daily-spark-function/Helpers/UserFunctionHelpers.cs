using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;

// Use alias to avoid ambiguity
using UserModel = DailySpark.Functions.Model.User;

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
}
