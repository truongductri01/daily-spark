using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using DailySpark.Functions.Model;
using DailySpark.Functions.Helpers;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Cors;

// Use aliases to avoid ambiguity
using CurriculumModel = DailySpark.Functions.Model.Curriculum;
using CurriculumResponseModel = DailySpark.Functions.Model.CurriculumResponse;

namespace DailySpark.Functions;

#region Curriculum Functions

public class GetCurriculaByUserId
{
    private readonly ILogger<GetCurriculaByUserId> _logger;

    public GetCurriculaByUserId(ILogger<GetCurriculaByUserId> logger)
    {
        _logger = logger;
    }

    [Function("GetCurriculaByUserId")]
    [EnableCors("AllowReactApp")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a get curricula by user ID request.");

        try
        {
            // Get userId from query parameters
            string? userId = req.Query["userId"];
            if (string.IsNullOrEmpty(userId))
            {
                return new BadRequestObjectResult("Please pass a userId on the query string");
            }

            // Get Cosmos DB container
            Container curriculumContainer = CurriculumFunctionHelpers.GetCurriculumContainer();

            // Get curricula by user ID
            List<CurriculumModel> curricula = await CurriculumFunctionHelpers.GetCurriculaByUserIdAsync(curriculumContainer, userId, _logger);

            _logger.LogInformation($"Successfully retrieved {curricula.Count} curricula for user ID: {userId}");

            return new OkObjectResult(curricula);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting curricula by user ID");
            return new StatusCodeResult(500);
        }
    }
}

public class GetCurriculum
{
    private readonly ILogger<GetCurriculum> _logger;

    public GetCurriculum(ILogger<GetCurriculum> logger)
    {
        _logger = logger;
    }

    [Function("GetCurriculum")]
    [EnableCors("AllowReactApp")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a get curriculum request.");

        try
        {
            // Get curriculumId and userId from query parameters
            string? curriculumId = req.Query["curriculumId"];
            string? userId = req.Query["userId"];

            if (string.IsNullOrEmpty(curriculumId))
            {
                return new BadRequestObjectResult("Please pass a curriculumId on the query string");
            }

            if (string.IsNullOrEmpty(userId))
            {
                return new BadRequestObjectResult("Please pass a userId on the query string");
            }

            // Get Cosmos DB container
            Container curriculumContainer = CurriculumFunctionHelpers.GetCurriculumContainer();

            // Get curriculum by ID and userId
            CurriculumModel? curriculum = await CurriculumFunctionHelpers.GetCurriculumByIdAsync(curriculumContainer, curriculumId, userId, _logger);
            if (curriculum == null)
            {
                return new NotFoundObjectResult($"Curriculum with ID '{curriculumId}' not found for user '{userId}'");
            }

            _logger.LogInformation($"Successfully retrieved curriculum with ID: {curriculumId}");

            return new OkObjectResult(new CurriculumResponseModel
            {
                Id = curriculum.Id,
                UserId = curriculum.UserId,
                CourseTitle = curriculum.CourseTitle,
                Status = curriculum.Status,
                NextReminderDate = curriculum.NextReminderDate,
                Topics = curriculum.Topics,
                PartitionKey = curriculum.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting curriculum");
            return new StatusCodeResult(500);
        }
    }
}

public class CreateCurriculum
{
    private readonly ILogger<CreateCurriculum> _logger;

    public CreateCurriculum(ILogger<CreateCurriculum> logger)
    {
        _logger = logger;
    }

    [Function("CreateCurriculum")]
    [EnableCors("AllowReactApp")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a create curriculum request.");

        try
        {
            // Parse request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                return new BadRequestObjectResult("Request body is required");
            }

            CreateCurriculumRequest? requestData = JsonConvert.DeserializeObject<CreateCurriculumRequest>(requestBody);
            if (requestData == null)
            {
                return new BadRequestObjectResult("Invalid request format");
            }

            // Validate required fields
            if (string.IsNullOrEmpty(requestData.UserId))
            {
                return new BadRequestObjectResult("UserId is required");
            }

            if (string.IsNullOrEmpty(requestData.CourseTitle))
            {
                return new BadRequestObjectResult("CourseTitle is required");
            }

            // Get Cosmos DB container
            Container curriculumContainer = CurriculumFunctionHelpers.GetCurriculumContainer();

            // Check if curriculum with provided ID already exists (if ID was provided)
            if (!string.IsNullOrEmpty(requestData.Id))
            {
                bool curriculumExists = await CurriculumFunctionHelpers.CheckCurriculumExistsAsync(curriculumContainer, requestData.Id, _logger);
                if (curriculumExists)
                {
                    return new BadRequestObjectResult($"Curriculum with ID '{requestData.Id}' already exists");
                }
            }

            // Generate curriculum ID if not provided
            string curriculumId = requestData.Id ?? Guid.NewGuid().ToString();

            // Create curriculum record
            CurriculumModel curriculum = new CurriculumModel
            {
                Id = curriculumId,
                UserId = requestData.UserId,
                CourseTitle = requestData.CourseTitle,
                Status = requestData.Status,
                NextReminderDate = requestData.NextReminderDate,
                Topics = requestData.Topics,
                PartitionKey = requestData.UserId // Use userId as partition key
            };

            // Save to Cosmos DB
            await curriculumContainer.CreateItemAsync(curriculum, new PartitionKey(curriculum.UserId));

            _logger.LogInformation($"Successfully created curriculum with ID: {curriculumId}");

            return new OkObjectResult(new CurriculumResponseModel
            {
                Id = curriculum.Id,
                UserId = curriculum.UserId,
                CourseTitle = curriculum.CourseTitle,
                Status = curriculum.Status,
                NextReminderDate = curriculum.NextReminderDate,
                Topics = curriculum.Topics,
                PartitionKey = curriculum.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating curriculum");
            return new StatusCodeResult(500);
        }
    }
}

public class UpdateCurriculum
{
    private readonly ILogger<UpdateCurriculum> _logger;

    public UpdateCurriculum(ILogger<UpdateCurriculum> logger)
    {
        _logger = logger;
    }

    [Function("UpdateCurriculum")]
    [EnableCors("AllowReactApp")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "put")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed an update curriculum request.");

        try
        {
            // Parse request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                return new BadRequestObjectResult("Request body is required");
            }

            UpdateCurriculumRequest? requestData = JsonConvert.DeserializeObject<UpdateCurriculumRequest>(requestBody);
            if (requestData == null)
            {
                return new BadRequestObjectResult("Invalid request format");
            }

            // Validate required fields
            if (string.IsNullOrEmpty(requestData.Id))
            {
                return new BadRequestObjectResult("Id is required");
            }

            if (string.IsNullOrEmpty(requestData.UserId))
            {
                return new BadRequestObjectResult("UserId is required");
            }

            // Get Cosmos DB container
            Container curriculumContainer = CurriculumFunctionHelpers.GetCurriculumContainer();

            // Check if curriculum exists
            CurriculumModel? existingCurriculum = await CurriculumFunctionHelpers.GetCurriculumByIdAsync(curriculumContainer, requestData.Id, requestData.UserId, _logger);
            if (existingCurriculum == null)
            {
                return new NotFoundObjectResult($"Curriculum with ID '{requestData.Id}' not found for user '{requestData.UserId}'");
            }

            // Update curriculum fields if provided
            bool hasChanges = false;
            if (!string.IsNullOrEmpty(requestData.CourseTitle) && requestData.CourseTitle != existingCurriculum.CourseTitle)
            {
                existingCurriculum.CourseTitle = requestData.CourseTitle;
                hasChanges = true;
            }

            if (requestData.Status.HasValue && requestData.Status.Value != existingCurriculum.Status)
            {
                existingCurriculum.Status = requestData.Status.Value;
                hasChanges = true;
            }

            if (requestData.NextReminderDate.HasValue && requestData.NextReminderDate.Value != existingCurriculum.NextReminderDate)
            {
                existingCurriculum.NextReminderDate = requestData.NextReminderDate.Value;
                hasChanges = true;
            }

            if (requestData.Topics != null && !requestData.Topics.SequenceEqual(existingCurriculum.Topics))
            {
                existingCurriculum.Topics = requestData.Topics;
                hasChanges = true;
            }

            if (!hasChanges)
            {
                return new OkObjectResult(new CurriculumResponseModel
                {
                    Id = existingCurriculum.Id,
                    UserId = existingCurriculum.UserId,
                    CourseTitle = existingCurriculum.CourseTitle,
                    Status = existingCurriculum.Status,
                    NextReminderDate = existingCurriculum.NextReminderDate,
                    Topics = existingCurriculum.Topics,
                    PartitionKey = existingCurriculum.PartitionKey
                });
            }

            // Save updated curriculum to Cosmos DB
            await curriculumContainer.ReplaceItemAsync(existingCurriculum, existingCurriculum.Id, new PartitionKey(existingCurriculum.UserId));

            _logger.LogInformation($"Successfully updated curriculum with ID: {existingCurriculum.Id}");

            return new OkObjectResult(new CurriculumResponseModel
            {
                Id = existingCurriculum.Id,
                UserId = existingCurriculum.UserId,
                CourseTitle = existingCurriculum.CourseTitle,
                Status = existingCurriculum.Status,
                NextReminderDate = existingCurriculum.NextReminderDate,
                Topics = existingCurriculum.Topics,
                PartitionKey = existingCurriculum.PartitionKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating curriculum");
            return new StatusCodeResult(500);
        }
    }
}

#endregion
