using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using DailySpark.Functions.Model;

// Use alias to avoid ambiguity
using CurriculumModel = DailySpark.Functions.Model.Curriculum;

namespace DailySpark.Functions.Helpers;

public static class CurriculumFunctionHelpers
{
    public static Container GetCurriculumContainer()
    {
        string? cosmosDbAccountEndpoint = Environment.GetEnvironmentVariable("COSMOS_DB_ACCOUNT_ENDPOINT");
        string? apiKey = Environment.GetEnvironmentVariable("COSMOS_DB_API_KEY");
        string? databaseId = Environment.GetEnvironmentVariable("COSMOS_DB_DATABASE_ID");
        string? curriculumContainerId = Environment.GetEnvironmentVariable("COSMOS_DB_CURRICULUM_CONTAINER_ID");

        if (string.IsNullOrEmpty(cosmosDbAccountEndpoint) || string.IsNullOrEmpty(apiKey) ||
            string.IsNullOrEmpty(databaseId) || string.IsNullOrEmpty(curriculumContainerId))
        {
            throw new InvalidOperationException("Cosmos DB configuration is missing.");
        }

        CosmosClient cosmosClient = new CosmosClient(cosmosDbAccountEndpoint, apiKey);
        Database database = cosmosClient.GetDatabase(databaseId);
        return database.GetContainer(curriculumContainerId);
    }

    public static async Task<bool> CheckCurriculumExistsAsync(Container container, string curriculumId, ILogger logger)
    {
        try
        {
            string query = "SELECT VALUE COUNT(1) FROM c WHERE c.id = @curriculumId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@curriculumId", curriculumId);

            FeedIterator<int> iterator = container.GetItemQueryIterator<int>(queryDefinition);
            FeedResponse<int> response = await iterator.ReadNextAsync();

            return response.FirstOrDefault() > 0;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error checking if curriculum exists: {curriculumId}");
            throw;
        }
    }

    public static async Task<CurriculumModel?> GetCurriculumByIdAsync(Container container, string curriculumId, string userId, ILogger logger)
    {
        try
        {
            string query = "SELECT * FROM c WHERE c.id = @curriculumId AND c.userId = @userId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@curriculumId", curriculumId)
                .WithParameter("@userId", userId);

            FeedIterator<CurriculumModel> iterator = container.GetItemQueryIterator<CurriculumModel>(
                queryDefinition,
                requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) }
            );

            if (!iterator.HasMoreResults)
            {
                return null;
            }

            FeedResponse<CurriculumModel> response = await iterator.ReadNextAsync();
            return response.FirstOrDefault();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error getting curriculum by ID: {curriculumId} for user: {userId}");
            throw;
        }
    }

    public static async Task<List<CurriculumModel>> GetCurriculaByUserIdAsync(Container container, string userId, ILogger logger)
    {
        try
        {
            string query = "SELECT * FROM c WHERE c.userId = @userId";
            QueryDefinition queryDefinition = new QueryDefinition(query)
                .WithParameter("@userId", userId);

            FeedIterator<CurriculumModel> iterator = container.GetItemQueryIterator<CurriculumModel>(
                queryDefinition,
                requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) }
            );

            List<CurriculumModel> curricula = new List<CurriculumModel>();
            while (iterator.HasMoreResults)
            {
                FeedResponse<CurriculumModel> response = await iterator.ReadNextAsync();
                foreach (var curriculum in response)
                {
                    curricula.Add(curriculum);
                }
            }

            return curricula;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error getting curricula by user ID: {userId}");
            throw;
        }
    }
}
