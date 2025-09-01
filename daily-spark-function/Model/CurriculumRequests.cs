using DailySpark.Functions.Model;
using Newtonsoft.Json;

namespace DailySpark.Functions.Model;

// For CreateCurriculum: Use Curriculum model with optional Id
public record CreateCurriculumRequest
{
    [JsonProperty("id")]
    public string? Id { get; set; }

    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonProperty("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonProperty("status")]
    public CurriculumStatus Status { get; set; } = CurriculumStatus.NotStarted;

    [JsonProperty("nextReminderDate")]
    public DateTime NextReminderDate { get; set; }

    [JsonProperty("topics")]
    public List<Topic> Topics { get; set; } = new List<Topic>();
}

// For UpdateCurriculum: Use Curriculum model with required Id and UserId
public record UpdateCurriculumRequest
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonProperty("courseTitle")]
    public string? CourseTitle { get; set; }

    [JsonProperty("status")]
    public CurriculumStatus? Status { get; set; }

    [JsonProperty("nextReminderDate")]
    public DateTime? NextReminderDate { get; set; }

    [JsonProperty("topics")]
    public List<Topic>? Topics { get; set; }
}

// For responses: Use Curriculum model directly
public record CurriculumResponse : Curriculum
{
}
