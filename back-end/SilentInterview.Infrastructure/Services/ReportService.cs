using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Report;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly SilentInterviewDbContext _context;

    public ReportService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ReportDto>> GetAllAsync(
        ReportQueryParameters parameters)
    {
        IQueryable<Report> query = _context.Reports.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();

            query = query.Where(x =>
                x.Feedback.ToLower().Contains(search));
        }

        // Interview Session Filter
        if (parameters.InterviewSessionId.HasValue)
        {
            query = query.Where(x =>
                x.InterviewSessionId == parameters.InterviewSessionId.Value);
        }

        // Minimum Score
        if (parameters.MinScore.HasValue)
        {
            query = query.Where(x =>
                x.Score >= parameters.MinScore.Value);
        }

        // Maximum Score
        if (parameters.MaxScore.HasValue)
        {
            query = query.Where(x =>
                x.Score <= parameters.MaxScore.Value);
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "score" => parameters.Descending
                ? query.OrderByDescending(x => x.Score)
                : query.OrderBy(x => x.Score),

            "createdat" => parameters.Descending
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt),

            "interviewsessionid" => parameters.Descending
                ? query.OrderByDescending(x => x.InterviewSessionId)
                : query.OrderBy(x => x.InterviewSessionId),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Id)
                : query.OrderBy(x => x.Id)
        };

        var totalCount = await query.CountAsync();

        var reports = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<ReportDto>
        {
            Items = reports.Select(ToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize
        };
    }

    public async Task<ReportDto?> GetByIdAsync(Guid id)
    {
        var report = await _context.Reports
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return report == null
            ? null
            : ToDto(report);
    }

    public async Task<ReportDto> CreateAsync(CreateReportRequest request)
    {
        var report = new Report
        {
            Id = Guid.NewGuid(),
            InterviewSessionId = request.InterviewSessionId,
            Score = request.Score,
            Feedback = request.Feedback,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reports.Add(report);

        await _context.SaveChangesAsync();

        return ToDto(report);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateReportRequest request)
    {
        var report = await _context.Reports.FindAsync(id);

        if (report == null)
            return false;

        report.Score = request.Score;
        report.Feedback = request.Feedback;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var report = await _context.Reports.FindAsync(id);

        if (report == null)
            return false;

        _context.Reports.Remove(report);

        await _context.SaveChangesAsync();

        return true;
    }

    private static ReportDto ToDto(Report report)
    {
        return new ReportDto
        {
            Id = report.Id,
            InterviewSessionId = report.InterviewSessionId,
            Score = report.Score,
            Feedback = report.Feedback,
            CreatedAt = report.CreatedAt
        };
    }
}