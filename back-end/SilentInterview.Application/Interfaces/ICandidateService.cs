using SilentInterview.Application.DTOs.Candidate;

namespace SilentInterview.Application.Interfaces;

public interface ICandidateService
{
    Task<List<CandidateDto>> GetAllAsync();

    Task<CandidateDto?> GetByIdAsync(Guid id);

    Task<CandidateDto> CreateAsync(CreateCandidateRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateCandidateRequest request);

    Task<bool> DeleteAsync(Guid id);
}