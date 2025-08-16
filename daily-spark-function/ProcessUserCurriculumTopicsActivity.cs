using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using DailySpark.Functions.Contract;
using DailySpark.Functions.Helpers;

namespace DailySpark.Functions;

public class ProcessUserCurriculumTopicsActivity
{
    private readonly ILogger<ProcessUserCurriculumTopicsActivity> _logger;
    private readonly UserCurriculumService _userCurriculumService;

    public ProcessUserCurriculumTopicsActivity(ILogger<ProcessUserCurriculumTopicsActivity> logger)
    {
        _logger = logger;
        _userCurriculumService = new UserCurriculumService(logger);
    }

    [Function("ProcessUserCurriculumTopicsActivity")]
    public async Task<QueryCurriculumTopicsResponse?> RunAsync([ActivityTrigger] string userId, FunctionContext context)
    {
        _logger.LogInformation($"Processing curriculum topics for user: {userId}");

        try
        {
            // Use the reusable service to process user curriculum topics
            QueryCurriculumTopicsResponse? result = await _userCurriculumService.ProcessUserCurriculumTopicsAsync(userId);

            if (result != null)
            {
                _logger.LogInformation($"Successfully processed curriculum topics for user: {userId}");
            }
            else
            {
                _logger.LogWarning($"No curriculum topics found for user: {userId}");
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing curriculum topics for user {userId}");
            throw;
        }
    }
}
