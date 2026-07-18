using System.Text;
using System.Text.Json;

using Microsoft.Extensions.Configuration;

using SilentInterview.Application.Common.Interfaces;

namespace SilentInterview.Infrastructure.AI;

public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenAIService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;

        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer",
                _configuration["OpenAI:ApiKey"]);
    }

    public async Task<string> GenerateNextQuestionAsync(
        string position,
        string candidateAnswer,
        List<string> previousMessages,
        CancellationToken cancellationToken = default)
    {
        var prompt = BuildInterviewPrompt(
            position,
            candidateAnswer,
            previousMessages);

        var body = new
        {
            model = "gpt-5.5",
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content =
                        "You are an experienced HR interviewer."
                },
                new
                {
                    role = "user",
                    content = prompt
                }
            },
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(body);

        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json"),
            cancellationToken);

        response.EnsureSuccessStatusCode();

        var result =
            await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(result);

        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }

    public async Task<string> GenerateFeedbackAsync(
        string position,
        List<string> conversation,
        CancellationToken cancellationToken = default)
    {
        var prompt = $"""

Evaluate the candidate for the {position} position.

Conversation:

{string.Join(Environment.NewLine, conversation)}

Return professional feedback.

""";

        var body = new
        {
            model = "gpt-5.5",
            messages = new[]
            {
                new
                {
                    role="user",
                    content=prompt
                }
            }
        };

        var json = JsonSerializer.Serialize(body);

        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json"),
            cancellationToken);

        response.EnsureSuccessStatusCode();

        var result =
            await response.Content.ReadAsStringAsync(cancellationToken);

        using var doc = JsonDocument.Parse(result);

        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }

    private static string BuildInterviewPrompt(
        string position,
        string answer,
        List<string> history)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"Position: {position}");
        sb.AppendLine();

        sb.AppendLine("Conversation:");

        foreach (var item in history)
        {
            sb.AppendLine(item);
        }

        sb.AppendLine();

        sb.AppendLine($"Candidate Answer: {answer}");

        sb.AppendLine();

        sb.AppendLine(
            "Generate ONLY the next interview question. Do not explain anything.");

        return sb.ToString();
    }
}