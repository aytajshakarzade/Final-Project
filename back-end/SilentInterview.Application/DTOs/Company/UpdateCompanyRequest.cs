namespace SilentInterview.Application.DTOs.Company;

public class UpdateCompanyRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Website { get; set; } = string.Empty;
}