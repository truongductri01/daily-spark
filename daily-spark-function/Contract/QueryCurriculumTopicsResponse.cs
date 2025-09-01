namespace DailySpark.Functions.Contract;

using System.Collections.Generic;
using Newtonsoft.Json;

public record QueryCurriculumTopicsResponse
{
    [JsonProperty("displayName")]
    public string DisplayName { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("topics")]
    public List<ReturnTopic> Topics { get; set; } = new List<ReturnTopic>();
}
