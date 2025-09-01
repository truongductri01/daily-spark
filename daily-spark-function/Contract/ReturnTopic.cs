namespace DailySpark.Functions.Contract;

using DailySpark.Functions.Model;
using Newtonsoft.Json;
using System.Collections.Generic;

public record ReturnTopic
{
    [JsonProperty("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonProperty("title")]
    public string Title { get; set; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; set; } = string.Empty;

    [JsonProperty("estimatedTime")]
    public string EstimatedTime { get; set; } = string.Empty; // in seconds

    [JsonProperty("question")]
    public string Question { get; set; } = string.Empty;

    [JsonProperty("resources")]
    public List<string> Resources { get; set; } = new List<string>();

    [JsonProperty("status")]
    [JsonConverter(typeof(Newtonsoft.Json.Converters.StringEnumConverter))]
    public TopicStatus Status { get; set; } = TopicStatus.NotStarted;
}
