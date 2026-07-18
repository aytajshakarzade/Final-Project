using SilentInterview.Domain.Common;

namespace SilentInterview.Domain.Entities;

public class InterviewAnswer : BaseEntity
{
    public Guid InterviewSessionId { get; set; }

    public InterviewSession InterviewSession { get; set; } = null!;

    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public int Order { get; set; }
}