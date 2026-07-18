namespace SilentInterview.Application.Common.Interfaces;

public interface IOpenAIService
{
    Task<string> GenerateNextQuestionAsync(
        string position,
        string candidateAnswer,
        List<string> previousMessages,
        CancellationToken cancellationToken = default);

    Task<string> GenerateFeedbackAsync(
        string position,
        List<string> conversation,
        CancellationToken cancellationToken = default);
}