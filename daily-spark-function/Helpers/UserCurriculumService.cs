using Microsoft.Extensions.Logging;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using DailySpark.Functions.Model;
using DailySpark.Functions.Contract;
using DailySpark.Functions.Helpers;

// Use alias to avoid ambiguity
using UserModel = DailySpark.Functions.Model.User;

namespace DailySpark.Functions.Helpers;

public class UserCurriculumService
{
    private readonly ILogger _logger;

    public UserCurriculumService(ILogger logger)
    {
        _logger = logger;
    }

    public async Task<QueryCurriculumTopicsResponse?> ProcessUserCurriculumTopicsAsync(string userId)
    {
        try
        {
            // Get Cosmos containers
            (Container usersContainer, Container curriculumContainer) containers = GetCosmosContainers();

            // Query user by userId
            UserModel? user = GetUserById(containers.usersContainer, userId);
            if (user is null)
            {
                _logger.LogWarning($"User with id {userId} not found.");
                return null;
            }
            _logger.LogInformation($"User found: {user.Id}, {user.DisplayName}, {user.Email}");

            // Query curriculum topics
            List<Currciculum> curriculumList = GetCurriculaByUserId(containers.curriculumContainer, userId);
            if (curriculumList.Count == 0)
            {
                _logger.LogWarning($"No active curriculum topics found for user with id {userId}.");
                return null;
            }
            LogCurricula(curriculumList);

            // Build response
            List<ReturnTopic> returnTopics = BuildReturnTopics(curriculumList);
            _logger.LogInformation($"Total topics found for user {userId}: {returnTopics.Count}");

            QueryCurriculumTopicsResponse response = new QueryCurriculumTopicsResponse
            {
                DisplayName = user.DisplayName,
                Email = user.Email,
                Topics = returnTopics
            };

            // Send email with curriculum topics
            await EmailHelper.SendCurriculumTopicsEmailAsync(user.Email, user.DisplayName, returnTopics, _logger);

            _logger.LogInformation($"Successfully processed curriculum topics for user: {userId}");
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing curriculum topics for user {userId}");
            throw;
        }
    }

    private (Container usersContainer, Container curriculumContainer) GetCosmosContainers()
    {
        string? cosmosDbAccountEndpoint = Environment.GetEnvironmentVariable("COSMOS_DB_ACCOUNT_ENDPOINT");
        string? apiKey = Environment.GetEnvironmentVariable("COSMOS_DB_API_KEY");
        string? databaseId = Environment.GetEnvironmentVariable("COSMOS_DB_DATABASE_ID");
        string? userContainerId = Environment.GetEnvironmentVariable("COSMOS_DB_USER_CONTAINER_ID");
        string? curriculumContainerId = Environment.GetEnvironmentVariable("COSMOS_DB_CURRICULUM_CONTAINER_ID");

        if (string.IsNullOrEmpty(cosmosDbAccountEndpoint) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(databaseId) || string.IsNullOrEmpty(userContainerId) || string.IsNullOrEmpty(curriculumContainerId))
        {
            throw new InvalidOperationException("Cosmos DB endpoint or API key is not configured in environment variables.");
        }
        CosmosClient cosmosClient = new CosmosClient(cosmosDbAccountEndpoint, apiKey);
        Database database = cosmosClient.GetDatabase(databaseId);
        Container usersContainer = database.GetContainer(userContainerId);
        Container curriculumContainer = database.GetContainer(curriculumContainerId);
        return (usersContainer, curriculumContainer);
    }

    private UserModel? GetUserById(Container usersContainer, string userId)
    {
        string query = "SELECT * FROM c WHERE c.id = @userId";
        QueryDefinition queryDefinition = new QueryDefinition(query)
            .WithParameter("@userId", userId);
        FeedIterator<UserModel> userIterator = usersContainer.GetItemQueryIterator<UserModel>(
            queryDefinition,
            requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) }
        );
        if (!userIterator.HasMoreResults)
        {
            return null;
        }
        return userIterator.ReadNextAsync().Result.FirstOrDefault();
    }

    private List<Currciculum> GetCurriculaByUserId(Container curriculumContainer, string userId)
    {
        string curriculumQuery = "SELECT * FROM c WHERE c.userId = @userId AND c.status = @status";
        QueryDefinition curriculumQueryDefinition = new QueryDefinition(curriculumQuery)
            .WithParameter("@userId", userId)
            .WithParameter("@status", "Active");
        FeedIterator<dynamic> curriculumIterator = curriculumContainer.GetItemQueryIterator<dynamic>(
            curriculumQueryDefinition,
            requestOptions: new QueryRequestOptions { PartitionKey = new PartitionKey(userId) }
        );
        List<Currciculum> curriculumList = new List<Currciculum>();
        while (curriculumIterator.HasMoreResults)
        {
            FeedResponse<dynamic> response = curriculumIterator.ReadNextAsync().Result;
            foreach (var c in response)
            {
                var curriculum = JsonConvert.DeserializeObject<Currciculum>(c.ToString());
                if (curriculum != null)
                {
                    curriculumList.Add(curriculum);
                }
            }
        }
        return curriculumList;
    }

    private void LogCurricula(List<Currciculum> curriculumList)
    {
        foreach (Currciculum curriculum in curriculumList)
        {
            _logger.LogInformation($"Curriculum found: {curriculum.Id}, {curriculum.CourseTitle}, Status: {curriculum.Status}");
            foreach (Topic topic in curriculum.Topics)
            {
                _logger.LogInformation($"Topic found: {topic.Id}, {topic.Title}, Status: {topic.Status}");
            }
        }
    }

    private List<ReturnTopic> BuildReturnTopics(List<Currciculum> curriculumList)
    {
        List<ReturnTopic> returnTopics = new List<ReturnTopic>();
        foreach (Currciculum curriculum in curriculumList)
        {
            foreach (Topic topic in curriculum.Topics)
            {
                ReturnTopic returnTopic = new ReturnTopic
                {
                    CourseTitle = curriculum.CourseTitle,
                    Title = topic.Title,
                    Description = topic.Description,
                    EstimatedTime = FormatDuration(topic.EstimatedTime),
                    Question = topic.Question,
                    Resources = topic.Resources,
                    Status = topic.Status
                };
                returnTopics.Add(returnTopic);
            }
        }
        return returnTopics;
    }

    // Helper method to format seconds as hours, minutes, seconds
    private static string FormatDuration(int seconds)
    {
        if (seconds < 60)
            return $"{seconds} seconds";
        int minutes = seconds / 60;
        int hours = minutes / 60;
        minutes = minutes % 60;
        seconds = seconds % 60;
        if (hours > 0)
            return $"{hours} hour{(hours > 1 ? "s" : "")}{(minutes > 0 ? $" {minutes} minute{(minutes > 1 ? "s" : "")}" : "")}{(seconds > 0 ? $" {seconds} second{(seconds > 1 ? "s" : "")}" : "")}";
        if (minutes > 0)
            return $"{minutes} minute{(minutes > 1 ? "s" : "")}{(seconds > 0 ? $" {seconds} second{(seconds > 1 ? "s" : "")}" : "")}";
        return $"{seconds} seconds";
    }
}