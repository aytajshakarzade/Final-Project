using SilentInterview.Domain.Common;

namespace SilentInterview.Domain.Entities;

public class InterviewSession : BaseEntity
{
    public Guid JobApplicationId { get; set; }

    public JobApplication JobApplication { get; set; } = null!;

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public ICollection<InterviewAnswer> Answers { get; set; }
        = new List<InterviewAnswer>();

    public Report? Report { get; set; }
}