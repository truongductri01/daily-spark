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
        IReadOnlyList<string> userIds = await context.CallActivityAsync<IReadOnlyList<string>>("GetAllUserIdsActivity", null);
        logger.LogInformation($"Found {userIds.Count} user IDs.");

        // Create tasks for all activities to run in parallel
        List<Task<object>> tasks = new List<Task<object>>();
        foreach (string userId in userIds)
        {
            // Create task for each userId (don't await yet)
            Task<object> task = context.CallActivityAsync<object>("ProcessUserCurriculumTopicsActivity", userId);
            tasks.Add(task);
        }

        // Wait for all activities to complete in parallel
        logger.LogInformation($"Starting parallel execution of {tasks.Count} activities.");
        object[] results = await Task.WhenAll(tasks);

        logger.LogInformation($"Orchestration completed for {results.Length} users.");
        return results.ToList();
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
    public async Task<IReadOnlyList<string>> RunAsync([ActivityTrigger] string? input)
    {
        _logger.LogInformation("Querying Cosmos DB for all user IDs.");

        // Read Cosmos DB config from environment
        string? endpoint = Environment.GetEnvironmentVariable("COSMOS_DB_ACCOUNT_ENDPOINT");
        string? key = Environment.GetEnvironmentVariable("COSMOS_DB_API_KEY");
        string? databaseId = Environment.GetEnvironmentVariable("COSMOS_DB_DATABASE_ID");
        string? userContainerId = Environment.GetEnvironmentVariable("COSMOS_DB_USER_CONTAINER_ID");

        if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(key) || string.IsNullOrEmpty(databaseId) || string.IsNullOrEmpty(userContainerId))
        {
            _logger.LogError("Cosmos DB configuration is missing.");
            throw new InvalidOperationException("Cosmos DB configuration is missing.");
        }

        CosmosClient cosmosClient = new CosmosClient(endpoint, key);
        Container container = cosmosClient.GetContainer(databaseId, userContainerId);

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
