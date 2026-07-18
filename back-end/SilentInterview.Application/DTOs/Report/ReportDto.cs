namespace SilentInterview.Application.DTOs.Report;

public class ReportDto
{
    public Guid Id { get; set; }

    public Guid InterviewSessionId { get; set; }

    public int Score { get; set; }

    public string Feedback { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}