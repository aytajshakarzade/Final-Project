using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.InterviewSession;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class InterviewSessionService : IInterviewSessionService
{
    private readonly SilentInterviewDbContext _context;

    public InterviewSessionService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<InterviewSessionDto>> GetAllAsync(
        InterviewSessionQueryParameters parameters)
    {
        IQueryable<InterviewSession> query =
            _context.InterviewSessions.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();

            if (Guid.TryParse(search, out var guid))
            {
                query = query.Where(x =>
                    x.JobApplicationId == guid);
            }
        }

        // Job Application Filter
        if (parameters.JobApplicationId.HasValue)
        {
            query = query.Where(x =>
                x.JobApplicationId == parameters.JobApplicationId.Value);
        }

        // Date Filters
        if (parameters.StartedAfter.HasValue)
        {
            query = query.Where(x =>
                x.StartedAt >= parameters.StartedAfter.Value);
        }

        if (parameters.StartedBefore.HasValue)
        {
            query = query.Where(x =>
                x.StartedAt <= parameters.StartedBefore.Value);
        }

        // Completed Filter
        if (parameters.IsCompleted.HasValue)
        {
            query = parameters.IsCompleted.Value
                ? query.Where(x => x.EndedAt != null)
                : query.Where(x => x.EndedAt == null);
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "startedat" => parameters.Descending
                ? query.OrderByDescending(x => x.StartedAt)
                : query.OrderBy(x => x.StartedAt),

            "endedat" => parameters.Descending
                ? query.OrderByDescending(x => x.EndedAt)
                : query.OrderBy(x => x.EndedAt),

            "jobapplicationid" => parameters.Descending
                ? query.OrderByDescending(x => x.JobApplicationId)
                : query.OrderBy(x => x.JobApplicationId),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Id)
                : query.OrderBy(x => x.Id)
        };

        var totalCount = await query.CountAsync();

        var sessions = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<InterviewSessionDto>
        {
            Items = sessions.Select(ToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize
        };
    }

    public async Task<InterviewSessionDto?> GetByIdAsync(Guid id)
    {
        var session = await _context.InterviewSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return session == null ? null : ToDto(session);
    }

    public async Task<InterviewSessionDto> CreateAsync(
        CreateInterviewSessionRequest request)
    {
        var session = new InterviewSession
        {
            Id = Guid.NewGuid(),
            JobApplicationId = request.JobApplicationId,
            StartedAt = request.StartedAt
        };

        _context.InterviewSessions.Add(session);

        await _context.SaveChangesAsync();

        return ToDto(session);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateInterviewSessionRequest request)
    {
        var session = await _context.InterviewSessions.FindAsync(id);

        if (session == null)
            return false;

        session.StartedAt = request.StartedAt;
        session.EndedAt = request.EndedAt;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var session = await _context.InterviewSessions.FindAsync(id);

        if (session == null)
            return false;

        _context.InterviewSessions.Remove(session);

        await _context.SaveChangesAsync();

        return true;
    }

    private static InterviewSessionDto ToDto(InterviewSession session)
    {
        return new InterviewSessionDto
        {
            Id = session.Id,
            JobApplicationId = session.JobApplicationId,
            StartedAt = session.StartedAt,
            EndedAt = session.EndedAt
        };
    }
}