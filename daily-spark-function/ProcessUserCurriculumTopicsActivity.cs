using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using DailySpark.Functions.Model;
using DailySpark.Functions.Contract;
using DailySpark.Functions.Helpers;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;

namespace DailySpark.Functions;

public class ProcessUserCurriculumTopicsActivity
{
    private readonly ILogger<ProcessUserCurriculumTopicsActivity> _logger;

    public ProcessUserCurriculumTopicsActivity(ILogger<ProcessUserCurriculumTopicsActivity> logger)
    {
        _logger = logger;
    }

    [Function("ProcessUserCurriculumTopicsActivity")]
    public async Task<QueryCurriculumTopicsResponse?> RunAsync([ActivityTrigger] string userId, FunctionContext context)
    {
        _logger.LogInformation($"Processing curriculum topics for user: {userId}");

        // TODO: Move logic from QueryCurriculumTopicsByUserId here
        // 1. Get Cosmos containers
        // 2. Query user by userId
        // 3. Query curriculum topics
        // 4. Build response
        // 5. Send email
        // 6. Return QueryCurriculumTopicsResponse
        await Task.Delay(1000); // Simulate some processing delay

        return null;
    }
}
