namespace SilentInterview.Domain.Entities;

public class Report
{
    public Guid Id { get; set; }

    public Guid InterviewSessionId { get; set; }

    public InterviewSession InterviewSession { get; set; } = null!;

    public int Score { get; set; }

    public string Feedback { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}