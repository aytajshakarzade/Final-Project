using SilentInterview.Application.DTOs.Company;

namespace SilentInterview.Application.Interfaces;

public interface ICompanyService
{
    Task<List<CompanyDto>> GetAllAsync();

    Task<CompanyDto?> GetByIdAsync(Guid id);

    Task<CompanyDto> CreateAsync(CreateCompanyRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateCompanyRequest request);

    Task<bool> DeleteAsync(Guid id);
}