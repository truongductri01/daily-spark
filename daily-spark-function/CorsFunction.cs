using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace DailySpark.Functions;

/// <summary>
/// Global CORS function to handle OPTIONS requests
/// </summary>
public class CorsFunction
{
    private readonly ILogger<CorsFunction> _logger;

    public CorsFunction(ILogger<CorsFunction> logger)
    {
        _logger = logger;
    }

    [Function("Cors")]
    public Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "options")] HttpRequest req)
    {
        _logger.LogInformation("CORS preflight request received.");

        // Return a simple OK response with CORS headers
        return Task.FromResult<IActionResult>(new OkObjectResult(new { message = "CORS preflight successful" }));
    }
}
