using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.InterviewAnswer;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class InterviewAnswerService : IInterviewAnswerService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public InterviewAnswerService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<InterviewAnswerDto>> GetAllAsync()
    {
        var answers = await _context.InterviewAnswers.ToListAsync();

        return _mapper.Map<List<InterviewAnswerDto>>(answers);
    }

    public async Task<InterviewAnswerDto?> GetByIdAsync(Guid id)
    {
        var answer = await _context.InterviewAnswers.FindAsync(id);

        if (answer == null)
            return null;

        return _mapper.Map<InterviewAnswerDto>(answer);
    }

    public async Task<InterviewAnswerDto> CreateAsync(CreateInterviewAnswerRequest request)
    {
        var answer = _mapper.Map<InterviewAnswer>(request);

        answer.Id = Guid.NewGuid();

        _context.InterviewAnswers.Add(answer);

        await _context.SaveChangesAsync();

        return _mapper.Map<InterviewAnswerDto>(answer);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateInterviewAnswerRequest request)
    {
        var answer = await _context.InterviewAnswers.FindAsync(id);

        if (answer == null)
            return false;

        _mapper.Map(request, answer);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var answer = await _context.InterviewAnswers.FindAsync(id);

        if (answer == null)
            return false;

        _context.InterviewAnswers.Remove(answer);

        await _context.SaveChangesAsync();

        return true;
    }
}