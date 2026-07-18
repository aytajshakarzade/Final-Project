namespace SilentInterview.Application.DTOs.Job;

public class JobDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Requirements { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public Guid CompanyId { get; set; }
}