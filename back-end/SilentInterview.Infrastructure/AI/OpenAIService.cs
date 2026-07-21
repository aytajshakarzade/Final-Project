using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

using Microsoft.Extensions.Configuration;

using SilentInterview.Application.Common.Interfaces;
using SilentInterview.Infrastructure.AI.Prompts;

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

        var apiKey = _configuration["OpenAI:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "OpenAI API key is not configured.");
        }

        _httpClient.BaseAddress =
            new Uri(_configuration["OpenAI:BaseUrl"]!);

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task<string> GenerateNextQuestionAsync(
        string position,
        string candidateAnswer,
        List<string> previousMessages,
        CancellationToken cancellationToken = default)
    {
        var prompt = InterviewPromptBuilder.Build(
            position,
            candidateAnswer,
            previousMessages);

        var body = new
        {
            model = _configuration["OpenAI:ChatModel"],
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "You are an experienced HR interviewer."
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
            "chat/completions",
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json"),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error =
                await response.Content.ReadAsStringAsync(cancellationToken);

            throw new Exception($"OpenAI Error: {error}");
        }

        var result =
            await response.Content.ReadAsStringAsync(cancellationToken);

        using var document = JsonDocument.Parse(result);

        var choices = document.RootElement.GetProperty("choices");

        if (choices.GetArrayLength() == 0)
        {
            throw new Exception("OpenAI returned no choices.");
        }

        return choices[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!
            .Trim();
    }

    public async Task<string> GenerateFeedbackAsync(
        string position,
        List<string> conversation,
        CancellationToken cancellationToken = default)
    {
        var prompt = FeedbackPromptBuilder.Build(
            position,
            conversation);

        var body = new
        {
            model = _configuration["OpenAI:ChatModel"],
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content = "You are an experienced technical interviewer."
                },
                new
                {
                    role = "user",
                    content = prompt
                }
            },
            temperature = 0.3
        };

        var json = JsonSerializer.Serialize(body);

        var response = await _httpClient.PostAsync(
            "chat/completions",
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json"),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error =
                await response.Content.ReadAsStringAsync(cancellationToken);

            throw new Exception($"OpenAI Error: {error}");
        }

        var result =
            await response.Content.ReadAsStringAsync(cancellationToken);

        using var document = JsonDocument.Parse(result);

        var choices = document.RootElement.GetProperty("choices");

        if (choices.GetArrayLength() == 0)
        {
            throw new Exception("OpenAI returned no choices.");
        }

        return choices[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!
            .Trim();
    }
}