using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.InterviewAnswer;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class InterviewAnswerService : IInterviewAnswerService
{
    private readonly SilentInterviewDbContext _context;

    public InterviewAnswerService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InterviewAnswerDto>> GetAllAsync(
        InterviewAnswerQueryParameters parameters)
    {
        IQueryable<InterviewAnswer> query =
            _context.InterviewAnswers.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();

            query = query.Where(x =>
                x.Question.ToLower().Contains(search) ||
                x.Answer.ToLower().Contains(search));
        }

        // Interview Session Filter
        if (parameters.InterviewSessionId.HasValue)
        {
            query = query.Where(x =>
                x.InterviewSessionId == parameters.InterviewSessionId.Value);
        }

        // Order Filter
        if (parameters.Order.HasValue)
        {
            query = query.Where(x =>
                x.Order == parameters.Order.Value);
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "question" => parameters.Descending
                ? query.OrderByDescending(x => x.Question)
                : query.OrderBy(x => x.Question),

            "answer" => parameters.Descending
                ? query.OrderByDescending(x => x.Answer)
                : query.OrderBy(x => x.Answer),

            "order" => parameters.Descending
                ? query.OrderByDescending(x => x.Order)
                : query.OrderBy(x => x.Order),

            "interviewsessionid" => parameters.Descending
                ? query.OrderByDescending(x => x.InterviewSessionId)
                : query.OrderBy(x => x.InterviewSessionId),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Id)
                : query.OrderBy(x => x.Id)
        };

        var totalCount = await query.CountAsync();

        var answers = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<InterviewAnswerDto>
        {
            Items = answers.Select(ToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize
        };
    }

    public async Task<InterviewAnswerDto?> GetByIdAsync(Guid id)
    {
        var answer = await _context.InterviewAnswers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return answer == null
            ? null
            : ToDto(answer);
    }

    public async Task<InterviewAnswerDto> CreateAsync(
        CreateInterviewAnswerRequest request)
    {
        var answer = new InterviewAnswer
        {
            Id = Guid.NewGuid(),
            InterviewSessionId = request.InterviewSessionId,
            Question = request.Question,
            Answer = request.Answer,
            Order = request.Order
        };

        _context.InterviewAnswers.Add(answer);

        await _context.SaveChangesAsync();

        return ToDto(answer);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateInterviewAnswerRequest request)
    {
        var answer = await _context.InterviewAnswers.FindAsync(id);

        if (answer == null)
            return false;

        answer.Question = request.Question;
        answer.Answer = request.Answer;
        answer.Order = request.Order;

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

    private static InterviewAnswerDto ToDto(
        InterviewAnswer answer)
    {
        return new InterviewAnswerDto
        {
            Id = answer.Id,
            InterviewSessionId = answer.InterviewSessionId,
            Question = answer.Question,
            Answer = answer.Answer,
            Order = answer.Order
        };
    }
}