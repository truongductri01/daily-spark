using DailySpark.Functions.Model;
using System.Text.Json.Serialization;

namespace DailySpark.Functions.Model;

// For CreateCurriculum: Use Curriculum model with optional Id
public record CreateCurriculumRequest
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public CurriculumStatus Status { get; set; } = CurriculumStatus.NotStarted;

    [JsonPropertyName("nextReminderDate")]
    public DateTime NextReminderDate { get; set; }

    [JsonPropertyName("topics")]
    public List<Topic> Topics { get; set; } = new List<Topic>();
}

// For UpdateCurriculum: Use Curriculum model with required Id and UserId
public record UpdateCurriculumRequest
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("courseTitle")]
    public string? CourseTitle { get; set; }

    [JsonPropertyName("status")]
    public CurriculumStatus? Status { get; set; }

    [JsonPropertyName("nextReminderDate")]
    public DateTime? NextReminderDate { get; set; }

    [JsonPropertyName("topics")]
    public List<Topic>? Topics { get; set; }
}

// For responses: Use Curriculum model directly
public record CurriculumResponse : Curriculum
{
}
