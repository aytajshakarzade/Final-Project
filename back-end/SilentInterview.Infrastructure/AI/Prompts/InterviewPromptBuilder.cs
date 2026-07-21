using System.Text;

namespace SilentInterview.Infrastructure.AI.Prompts;

public static class InterviewPromptBuilder
{
    public static string Build(
        string position,
        string candidateAnswer,
        IReadOnlyCollection<string> history)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"Position: {position}");
        sb.AppendLine();

        sb.AppendLine("Previous conversation:");

        if (history.Count == 0)
        {
            sb.AppendLine("No previous conversation.");
        }
        else
        {
            foreach (var message in history)
            {
                sb.AppendLine(message);
            }
        }

        sb.AppendLine();

        sb.AppendLine("Candidate's latest answer:");
        sb.AppendLine(candidateAnswer);

        sb.AppendLine();

        sb.AppendLine("""
You are an experienced technical interviewer.

Your job is to ask ONE professional interview question.

Rules:

- Ask only ONE question.
- Do not explain the answer.
- Do not evaluate the candidate.
- Do not greet.
- Do not repeat previous questions.
- Make the next question depend on the candidate's previous answer.
- Keep the interview natural.

Return ONLY the next interview question.
""");

        return sb.ToString();
    }
}