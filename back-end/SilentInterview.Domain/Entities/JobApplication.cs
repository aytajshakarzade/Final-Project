using SilentInterview.Domain.Common;

namespace SilentInterview.Domain.Entities;

public class JobApplication : AuditableEntity
{
    public Guid CandidateId { get; set; }

    public Guid JobId { get; set; }

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public Candidate Candidate { get; set; } = null!;

    public Job Job { get; set; } = null!;

    public ICollection<InterviewSession> InterviewSessions { get; set; } = new List<InterviewSession>();
}