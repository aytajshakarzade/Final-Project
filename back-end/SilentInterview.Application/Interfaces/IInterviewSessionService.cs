using SilentInterview.Application.DTOs.InterviewSession;

namespace SilentInterview.Application.Interfaces;

public interface IInterviewSessionService
{
    Task<List<InterviewSessionDto>> GetAllAsync();

    Task<InterviewSessionDto?> GetByIdAsync(Guid id);

    Task<InterviewSessionDto> CreateAsync(CreateInterviewSessionRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateInterviewSessionRequest request);

    Task<bool> DeleteAsync(Guid id);
}