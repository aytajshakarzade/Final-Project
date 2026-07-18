namespace SilentInterview.Application.DTOs.InterviewAnswer;

public class CreateInterviewAnswerRequest
{
    public Guid InterviewSessionId { get; set; }

    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public int Order { get; set; }
}