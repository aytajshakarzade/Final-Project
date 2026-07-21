using System.Text;

namespace SilentInterview.Infrastructure.AI.Prompts;

public static class FeedbackPromptBuilder
{
    public static string Build(
        string position,
        IReadOnlyCollection<string> conversation)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"Position: {position}");
        sb.AppendLine();

        sb.AppendLine("Interview Conversation:");

        if (conversation.Count == 0)
        {
            sb.AppendLine("No interview conversation available.");
        }
        else
        {
            foreach (var item in conversation)
            {
                sb.AppendLine(item);
            }
        }

        sb.AppendLine();

        sb.AppendLine("""
You are a senior technical interviewer.

Evaluate the candidate professionally.

Return your response using the following format:

Overall Score: X/10

Technical Skills:
- ...

Communication:
- ...

Strengths:
- ...

Weaknesses:
- ...

Recommendation:
- Hire
- Consider
- Reject

Final Feedback:
- Provide a concise professional summary.
""");

        return sb.ToString();
    }
}