using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.JobApplication;

namespace SilentInterview.Application.Interfaces;

public interface IJobApplicationService
{
    Task<PagedResult<JobApplicationDto>> GetAllAsync(
        JobApplicationQueryParameters parameters);

    Task<JobApplicationDto?> GetByIdAsync(Guid id);

    Task<JobApplicationDto> CreateAsync(CreateJobApplicationRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateJobApplicationRequest request);

    Task<bool> DeleteAsync(Guid id);
}