using SilentInterview.Application.DTOs.Job;

namespace SilentInterview.Application.Interfaces;

public interface IJobService
{
    Task<List<JobDto>> GetAllAsync();

    Task<JobDto?> GetByIdAsync(Guid id);

    Task<JobDto> CreateAsync(CreateJobRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateJobRequest request);

    Task<bool> DeleteAsync(Guid id);
}