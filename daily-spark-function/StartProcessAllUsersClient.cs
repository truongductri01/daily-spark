using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.DurableTask.Client;

namespace DailySpark.Functions;

public class StartProcessAllUsersClient
{
    private readonly ILogger<StartProcessAllUsersClient> _logger;

    public StartProcessAllUsersClient(ILogger<StartProcessAllUsersClient> logger)
    {
        _logger = logger;
    }

    [Function("StartProcessAllUsersClient")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "get")] Microsoft.AspNetCore.Http.HttpRequest req,
        [DurableClient] DurableTaskClient client,
        FunctionContext context)
    {
        _logger.LogInformation("Received request to start all-users orchestration.");

        var instanceId = await client.ScheduleNewOrchestrationInstanceAsync(
            orchestratorName: "ProcessAllUsersOrchestrator");

        _logger.LogInformation($"Started orchestration with ID = {instanceId}");
        return new OkObjectResult($"Orchestration started. Instance ID: {instanceId}");
    }
}
