using Azure.Communication.Email;
using Azure;
using Microsoft.Extensions.Logging;
using System.Text;
using DailySpark.Functions.Contract;
using DailySpark.Functions.Model;

namespace DailySpark.Functions.Helpers
{
    public static class EmailHelper
    {
        public static async Task<bool> SendCurriculumTopicsEmailAsync(string recipientEmail, string displayName, List<Contract.ReturnTopic> topics, ILogger logger)
        {
            logger.LogInformation($"Preparing to send email to {recipientEmail} for user {displayName} with {topics.Count} topics.");
            string? connectionString = Environment.GetEnvironmentVariable("COMMUNICATION_SERVICES_CONNECTION_STRING");
            if (string.IsNullOrEmpty(connectionString))
            {
                logger.LogError("Azure Communication Services Email connection string is not configured.");
                return false;
            }

            EmailClient emailClient = new EmailClient(connectionString);
            string? senderAddress = Environment.GetEnvironmentVariable("SENDER_EMAIL_ADDRESS");
            if (string.IsNullOrEmpty(senderAddress))
            {
                logger.LogError("Sender email address is not configured in environment variables.");
                return false;
            }
            string subject = $"[DailySpark] - Daily Curriculum Topics, {displayName}";
            string htmlContent = BuildEmailBody(displayName, topics);

            EmailContent emailContent = new EmailContent(subject)
            {
                Html = htmlContent
            };
            EmailRecipients recipients = new EmailRecipients(new List<EmailAddress> { new EmailAddress(recipientEmail) });
            EmailMessage emailMessage = new EmailMessage(senderAddress, recipients, emailContent);

            try
            {
                EmailSendOperation operation = await emailClient.SendAsync(WaitUntil.Completed, emailMessage);
                EmailSendResult result = operation.Value;
                logger.LogInformation($"Email send status: {result.Status}");
                return result.Status == EmailSendStatus.Succeeded;
            }
            catch (Exception ex)
            {
                logger.LogError($"Failed to send email: {ex.Message}");
                return false;
            }
        }

        private static string BuildEmailBody(string displayName, List<ReturnTopic> topics)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<div style='max-width:600px;margin:2rem auto;font-family:Arial,sans-serif;background:#f9f9f9;padding:1rem;'>");
            sb.Append($"<h2 style='color:#f7b84a;'>🚀 Ready to Spark Your Learning, {displayName}!</h2>");
            foreach (ReturnTopic topic in topics)
            {
                sb.Append("<div style='background:#fff;border:1px solid #e3e3e3;padding:1rem;margin-bottom:1rem;color:#222;'>");
                sb.Append($"<span style='font-weight:bold;color:#1a4e8a;background:#eaf1fb;padding:2px 8px;'>");
                sb.Append(topic.CourseTitle);
                sb.Append("</span>");
                sb.Append($"<div style='font-weight:600;color:#222;margin:4px 0;'>✨ {topic.Title}</div>");
                sb.Append($"<span style='background:{(topic.Status == TopicStatus.Completed ? "#c8e6c9" : "#fff3d6")};color:{(topic.Status == TopicStatus.Completed ? "#388e3c" : "#f7b84a")};padding:2px 10px;'>Status: {topic.Status}</span>");
                sb.Append($"<p>Estimated Time: {topic.EstimatedTime}</p>");
                sb.Append($"<p>Description: {topic.Description}</p>");
                sb.Append($"<p>Question: {topic.Question}</p>");
                if (topic.Resources != null && topic.Resources.Count > 0)
                {
                    sb.Append("<p>Resources: ");
                    sb.Append(string.Join(", ", topic.Resources.ConvertAll(r => $"<a href='{r}' target='_blank' style='color:#2d6cdf;'>{r}</a>")));
                    sb.Append("</p>");
                }
                sb.Append("</div>");
            }
            sb.Append("</div>");
            string html = sb.ToString();
            // Minify: remove newlines, tabs, and extra spaces
            html = html.Replace("\n", "").Replace("\r", "").Replace("\t", "");
            while (html.Contains("  ")) html = html.Replace("  ", " ");
            return html;
        }
    }
}
