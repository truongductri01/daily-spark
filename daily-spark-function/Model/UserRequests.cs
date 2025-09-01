using Newtonsoft.Json;

namespace DailySpark.Functions.Model;

// For CreateUser: Use User model with optional Id
public record CreateUserRequest
{
    [JsonProperty("id")]
    public string? Id { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("displayName")]
    public string DisplayName { get; set; } = string.Empty;
}

// For UpdateUser: Use User model with required Id
public record UpdateUserRequest
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("displayName")]
    public string? DisplayName { get; set; }
}

// For responses: Use User model directly
public record UserResponse : User
{
}
