using SilentInterview.Domain.Common;

namespace SilentInterview.Domain.Entities;

public class Company : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string Industry { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ICollection<Recruiter> Recruiters { get; set; }
        = new List<Recruiter>();

    public ICollection<Job> Jobs { get; set; }
        = new List<Job>();
}