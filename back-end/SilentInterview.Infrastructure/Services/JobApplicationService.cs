using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.JobApplication;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly SilentInterviewDbContext _context;

    public JobApplicationService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<JobApplicationDto>> GetAllAsync(
        JobApplicationQueryParameters parameters)
    {
        IQueryable<JobApplication> query =
            _context.JobApplications.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();

            query = query.Where(x =>
                x.Status.ToLower().Contains(search));
        }

        // Candidate filter
        if (parameters.CandidateId.HasValue)
        {
            query = query.Where(x =>
                x.CandidateId == parameters.CandidateId.Value);
        }

        // Job filter
        if (parameters.JobId.HasValue)
        {
            query = query.Where(x =>
                x.JobId == parameters.JobId.Value);
        }

        // Status filter
        if (!string.IsNullOrWhiteSpace(parameters.Status))
        {
            query = query.Where(x =>
                x.Status == parameters.Status);
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "candidateid" => parameters.Descending
                ? query.OrderByDescending(x => x.CandidateId)
                : query.OrderBy(x => x.CandidateId),

            "jobid" => parameters.Descending
                ? query.OrderByDescending(x => x.JobId)
                : query.OrderBy(x => x.JobId),

            "status" => parameters.Descending
                ? query.OrderByDescending(x => x.Status)
                : query.OrderBy(x => x.Status),

            "appliedat" => parameters.Descending
                ? query.OrderByDescending(x => x.AppliedAt)
                : query.OrderBy(x => x.AppliedAt),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Id)
                : query.OrderBy(x => x.Id)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<JobApplicationDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize
        };
    }

    public async Task<JobApplicationDto?> GetByIdAsync(Guid id)
    {
        var entity = await _context.JobApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return entity == null ? null : ToDto(entity);
    }

    public async Task<JobApplicationDto> CreateAsync(
        CreateJobApplicationRequest request)
    {
        var entity = new JobApplication
        {
            Id = Guid.NewGuid(),
            CandidateId = request.CandidateId,
            JobId = request.JobId,
            AppliedAt = DateTime.UtcNow,
            Status = "Pending"
        };

        _context.JobApplications.Add(entity);

        await _context.SaveChangesAsync();

        return ToDto(entity);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateJobApplicationRequest request)
    {
        var entity = await _context.JobApplications.FindAsync(id);

        if (entity == null)
            return false;

        entity.Status = request.Status;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _context.JobApplications.FindAsync(id);

        if (entity == null)
            return false;

        _context.JobApplications.Remove(entity);

        await _context.SaveChangesAsync();

        return true;
    }

    private static JobApplicationDto ToDto(JobApplication entity)
    {
        return new JobApplicationDto
        {
            Id = entity.Id,
            CandidateId = entity.CandidateId,
            JobId = entity.JobId,
            AppliedAt = entity.AppliedAt,
            Status = entity.Status
        };
    }
}