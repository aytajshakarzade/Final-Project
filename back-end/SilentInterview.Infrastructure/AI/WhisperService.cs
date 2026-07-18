using System.Net.Http.Headers;
using System.Text.Json;

using Microsoft.Extensions.Configuration;

using SilentInterview.Application.Common.Interfaces;

namespace SilentInterview.Infrastructure.AI;

public class WhisperService : IWhisperService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public WhisperService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                _configuration["OpenAI:ApiKey"]);
    }

    public async Task<string> TranscribeAsync(
        Stream audioStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var form = new MultipartFormDataContent();

        var fileContent = new StreamContent(audioStream);

        fileContent.Headers.ContentType =
            new MediaTypeHeaderValue(contentType);

        form.Add(
            fileContent,
            "file",
            fileName);

        form.Add(
            new StringContent("whisper-1"),
            "model");

        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/audio/transcriptions",
            form,
            cancellationToken);

        response.EnsureSuccessStatusCode();

        var json =
            await response.Content.ReadAsStringAsync(cancellationToken);

        using var document = JsonDocument.Parse(json);

        return document.RootElement
            .GetProperty("text")
            .GetString()!;
    }
}