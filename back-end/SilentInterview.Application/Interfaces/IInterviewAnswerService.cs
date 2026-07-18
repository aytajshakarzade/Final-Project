using SilentInterview.Application.DTOs.InterviewAnswer;

namespace SilentInterview.Application.Interfaces;

public interface IInterviewAnswerService
{
    Task<List<InterviewAnswerDto>> GetAllAsync();

    Task<InterviewAnswerDto?> GetByIdAsync(Guid id);

    Task<InterviewAnswerDto> CreateAsync(CreateInterviewAnswerRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateInterviewAnswerRequest request);

    Task<bool> DeleteAsync(Guid id);
}