using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.InterviewAnswer;

namespace SilentInterview.Application.Interfaces;

public interface IInterviewAnswerService
{
    Task<PagedResult<InterviewAnswerDto>> GetAllAsync(
        InterviewAnswerQueryParameters parameters);

    Task<InterviewAnswerDto?> GetByIdAsync(Guid id);

    Task<InterviewAnswerDto> CreateAsync(CreateInterviewAnswerRequest request);

    Task<bool> UpdateAsync(Guid id, UpdateInterviewAnswerRequest request);

    Task<bool> DeleteAsync(Guid id);
}