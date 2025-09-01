namespace DailySpark.Functions.Contract;

using DailySpark.Functions.Model;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public record ReturnTopic
{
    [JsonPropertyName("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("estimatedTime")]
    public string EstimatedTime { get; set; } = string.Empty; // in seconds

    [JsonPropertyName("question")]
    public string Question { get; set; } = string.Empty;

    [JsonPropertyName("resources")]
    public List<string> Resources { get; set; } = new List<string>();

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TopicStatus Status { get; set; } = TopicStatus.NotStarted;
}
