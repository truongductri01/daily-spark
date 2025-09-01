namespace DailySpark.Functions.Model;

using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public record User
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    public string PartitionKey { get; set; } = string.Empty;
}

public record Curriculum
{
    public string PartitionKey { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public CurriculumStatus Status { get; set; } = CurriculumStatus.NotStarted;

    [JsonPropertyName("nextReminderDate")]
    public DateTime NextReminderDate { get; set; }

    [JsonPropertyName("topics")]
    public List<Topic> Topics { get; set; } = new List<Topic>();
}

public record Topic
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("estimatedTime")]
    public int EstimatedTime { get; set; } // in seconds

    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("resources")]
    public List<string> Resources { get; set; } = new List<string>();

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TopicStatus Status { get; set; } = TopicStatus.NotStarted;
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TopicStatus
{
    NotStarted,
    InProgress,
    Completed
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CurriculumStatus
{
    NotStarted,
    InProgress,
    Completed,
    Active
}

public record UserCounter
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("totalUsers")]
    public int TotalUsers { get; set; } = 0;

    [JsonPropertyName("lastUpdated")]
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public string PartitionKey { get; set; } = string.Empty;
}
