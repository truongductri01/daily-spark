namespace DailySpark.Functions.Contract;

using System.Collections.Generic;
using System.Text.Json.Serialization;

public record QueryCurriculumTopicsResponse
{
    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("topics")]
    public List<ReturnTopic> Topics { get; set; } = new List<ReturnTopic>();
}
