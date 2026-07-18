namespace SilentInterview.Application.DTOs.InterviewAnswer;

public class UpdateInterviewAnswerRequest
{
    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public int Order { get; set; }
}