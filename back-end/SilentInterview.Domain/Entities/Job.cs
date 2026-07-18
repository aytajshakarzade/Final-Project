using SilentInterview.Domain.Common;
using static System.Net.Mime.MediaTypeNames;

namespace SilentInterview.Domain.Entities;

public class Job : AuditableEntity
{
    public Guid CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Requirements { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public ICollection<JobApplication> Applications { get; set; }
        = new List<JobApplication>();
}