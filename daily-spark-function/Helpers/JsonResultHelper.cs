using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DailySpark.Functions.Helpers
{
    public static class JsonResultHelper
    {
        public static ContentResult CreateJsonResult(object response, int statusCode = 200)
        {
            return new ContentResult
            {
                Content = JsonSerializer.Serialize(response),
                ContentType = "application/json",
                StatusCode = statusCode
            };
        }
    }
}
