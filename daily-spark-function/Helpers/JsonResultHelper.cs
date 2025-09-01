using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace DailySpark.Functions.Helpers
{
    public static class JsonResultHelper
    {
        public static ContentResult CreateJsonResult(object response, int statusCode = 200)
        {
            return new ContentResult
            {
                Content = JsonConvert.SerializeObject(response),
                ContentType = "application/json",
                StatusCode = statusCode
            };
        }
    }
}
