using SilentInterview.Application.DTOs.Report;

namespace SilentInterview.Application.Interfaces;

public interface IReportService
{
    Task<List<ReportDto>> GetAllAsync();

    Task<ReportDto?> GetByIdAsync(Guid id);

    Task<ReportDto> CreateAsync(CreateReportRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateReportRequest request);

    Task<bool> DeleteAsync(Guid id);
}