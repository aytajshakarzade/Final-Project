using SilentInterview.Application.DTOs.Recruiter;

namespace SilentInterview.Application.Interfaces;

public interface IRecruiterService
{
    Task<List<RecruiterDto>> GetAllAsync();

    Task<RecruiterDto?> GetByIdAsync(Guid id);

    Task<RecruiterDto> CreateAsync(CreateRecruiterRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateRecruiterRequest request);

    Task<bool> DeleteAsync(Guid id);
}