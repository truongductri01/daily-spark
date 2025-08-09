using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Microsoft.DurableTask;

namespace DailySpark.Functions;

public class ProcessAllUsersOrchestrator
{
    [Function("ProcessAllUsersOrchestrator")]
    public async Task<IReadOnlyList<object>> RunOrchestratorAsync(
        [OrchestrationTrigger] TaskOrchestrationContext context)
    {
        ILogger logger = context.CreateReplaySafeLogger("ProcessAllUsersOrchestrator");
        logger.LogInformation("Starting orchestration to process all users.");

        // Query Cosmos DB for all user IDs
        IReadOnlyList<string> userIds = await context.CallActivityAsync<IReadOnlyList<string>>("GetAllUserIdsActivity", (object?)null);

        List<object> results = new List<object>();
        foreach (string userId in userIds)
        {
            // Fan-out: call activity for each userId
            object result = await context.CallActivityAsync<object>("ProcessUserCurriculumTopicsActivity", userId);
            results.Add(result);
        }
        logger.LogInformation($"Orchestration completed for {results.Count} users.");
        return results;
    }
}

public class GetAllUserIdsActivity
{
    private readonly ILogger<GetAllUserIdsActivity> _logger;

    public GetAllUserIdsActivity(ILogger<GetAllUserIdsActivity> logger)
    {
        _logger = logger;
    }

    [Function("GetAllUserIdsActivity")]
    public async Task<IReadOnlyList<string>> RunAsync([ActivityTrigger] TaskActivityContext context)
    {
        _logger.LogInformation("Querying Cosmos DB for all user IDs.");

        // Read Cosmos DB config from environment
        string? endpoint = Environment.GetEnvironmentVariable("CosmosDbEndpoint");
        string? key = Environment.GetEnvironmentVariable("CosmosDbKey");
        string? databaseId = Environment.GetEnvironmentVariable("CosmosDbDatabaseId");
        string? containerId = Environment.GetEnvironmentVariable("CosmosDbUserContainerId");

        if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(databaseId) || string.IsNullOrEmpty(containerId))
        {
            _logger.LogError("Cosmos DB configuration is missing.");
            throw new InvalidOperationException("Cosmos DB configuration is missing.");
        }

        CosmosClient cosmosClient = new CosmosClient(endpoint, key);
        Container container = cosmosClient.GetContainer(databaseId, containerId);

        List<string> userIds = new List<string>();
        QueryDefinition query = new QueryDefinition("SELECT c.id FROM c");
        FeedIterator<dynamic> iterator = container.GetItemQueryIterator<dynamic>(query);
        while (iterator.HasMoreResults)
        {
            FeedResponse<dynamic> response = await iterator.ReadNextAsync();
            foreach (dynamic item in response)
            {
                userIds.Add(item.id.ToString());
            }
        }
        _logger.LogInformation($"Found {userIds.Count} user IDs.");
        return userIds;
    }
}
