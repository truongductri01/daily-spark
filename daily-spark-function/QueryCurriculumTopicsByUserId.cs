using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using DailySpark.Functions.Helpers;
using DailySpark.Functions.Contract;

namespace DailySpark.Functions;

public class QueryCurriculumTopicsByUserId
{
    private readonly ILogger<QueryCurriculumTopicsByUserId> _logger;
    private readonly UserCurriculumService _userCurriculumService;

    public QueryCurriculumTopicsByUserId(ILogger<QueryCurriculumTopicsByUserId> logger)
    {
        _logger = logger;
        _userCurriculumService = new UserCurriculumService(logger);
    }

    [Function("QueryCurriculumTopicsByUserId")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        string? userId = GetUserIdFromRequest(req);
        if (string.IsNullOrEmpty(userId))
        {
            return new BadRequestObjectResult("Please pass a userId on the query string");
        }

        try
        {
            // Use the reusable service to process user curriculum topics
            QueryCurriculumTopicsResponse? response = await _userCurriculumService.ProcessUserCurriculumTopicsAsync(userId);

            if (response == null)
            {
                return new NotFoundObjectResult($"No curriculum topics found for user with id {userId}.");
            }

            // explicitly create a JSON result using the string serialization helper
            return JsonResultHelper.CreateJsonResult(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing request for user {userId}");
            return new StatusCodeResult(500);
        }
    }

    private string? GetUserIdFromRequest(HttpRequest req)
    {
        return req.Query["userId"];
    }
}