using System.Text.Json.Serialization;

namespace DailySpark.Functions.Model;

// For CreateUser: Use User model with optional Id
public record CreateUserRequest
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("displayName")]
    public string DisplayName { get; set; } = string.Empty;
}

// For UpdateUser: Use User model with required Id
public record UpdateUserRequest
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }
}

// For responses: Use User model directly
public record UserResponse : User
{
}
