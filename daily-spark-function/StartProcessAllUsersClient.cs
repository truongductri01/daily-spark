using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.DurableTask.Client;
using Microsoft.Azure.Functions.Worker.Http;

namespace DailySpark.Functions;

public class StartProcessAllUsersClient
{
    private readonly ILogger<StartProcessAllUsersClient> _logger;

    public StartProcessAllUsersClient(ILogger<StartProcessAllUsersClient> logger)
    {
        _logger = logger;
    }

    [Function("StartProcessAllUsersClient")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "get")] HttpRequestData req,
        [DurableClient] DurableTaskClient client,
        FunctionContext context)
    {
        _logger.LogInformation("Received request to start all-users orchestration.");

        string instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
            orchestratorName: "ProcessAllUsersOrchestrator");

        _logger.LogInformation($"Started orchestration with ID = {instanceId}");
        return client.CreateCheckStatusResponse(req, instanceId);
    }
}
