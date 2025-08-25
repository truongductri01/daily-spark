namespace DailySpark.Functions.Model;

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json.Converters;

public record User
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    public string PartitionKey { get; set; } = string.Empty;
}

public record Curriculum
{
    public string PartitionKey { get; set; } = string.Empty;

    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonProperty("courseTitle")]
    public string CourseTitle { get; set; } = string.Empty;

    [JsonProperty("status")]
    [JsonConverter(typeof(StringEnumConverter))]
    public CurriculumStatus Status { get; set; } = CurriculumStatus.NotStarted;

    [JsonProperty("nextReminderDate")]
    public DateTime NextReminderDate { get; set; }

    [JsonProperty("topics")]
    public List<Topic> Topics { get; set; } = new List<Topic>();
}

public record Topic
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("title")]
    public string Title { get; set; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; set; } = string.Empty;

    [JsonProperty("estimatedTime")]
    public int EstimatedTime { get; set; } // in seconds

    [JsonProperty("question")]
    public string Question { get; set; } = string.Empty;

    [JsonProperty("resources")]
    public List<string> Resources { get; set; } = new List<string>();

    [JsonProperty("status")]
    [JsonConverter(typeof(StringEnumConverter))]
    public TopicStatus Status { get; set; } = TopicStatus.NotStarted;
}

[JsonConverter(typeof(StringEnumConverter))]
public enum TopicStatus
{
    [EnumMember(Value = "NotStarted")]
    NotStarted,

    [EnumMember(Value = "InProgress")]
    InProgress,

    [EnumMember(Value = "Completed")]
    Completed
}

[JsonConverter(typeof(StringEnumConverter))]
public enum CurriculumStatus
{
    [EnumMember(Value = "NotStarted")]
    NotStarted,

    [EnumMember(Value = "InProgress")]
    InProgress,

    [EnumMember(Value = "Completed")]
    Completed,

    [EnumMember(Value = "Active")]
    Active
}
