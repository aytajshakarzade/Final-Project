using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Recruiter;

namespace SilentInterview.Application.Interfaces;

public interface IRecruiterService
{
    Task<PagedResult<RecruiterDto>> GetAllAsync(
        RecruiterQueryParameters parameters);

    Task<RecruiterDto?> GetByIdAsync(Guid id);

    Task<RecruiterDto> CreateAsync(CreateRecruiterRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateRecruiterRequest request);

    Task<bool> DeleteAsync(Guid id);
}