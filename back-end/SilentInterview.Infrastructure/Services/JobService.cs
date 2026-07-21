using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Job;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly SilentInterviewDbContext _context;

    public JobService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<JobDto>> GetAllAsync(
        JobQueryParameters parameters)
    {
        IQueryable<Job> query = _context.Jobs.AsNoTracking();

        // ============================
        // Search
        // ============================

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();

            query = query.Where(x =>
                x.Title.Contains(search) ||
                x.Description.Contains(search) ||
                x.Requirements.Contains(search));
        }

        // ============================
        // Company Filter
        // ============================

        if (parameters.CompanyId.HasValue)
        {
            query = query.Where(x =>
                x.CompanyId == parameters.CompanyId.Value);
        }

        // ============================
        // Salary Filter
        // ============================

        if (parameters.MinSalary.HasValue)
        {
            query = query.Where(x =>
                x.Salary >= parameters.MinSalary.Value);
        }

        if (parameters.MaxSalary.HasValue)
        {
            query = query.Where(x =>
                x.Salary <= parameters.MaxSalary.Value);
        }

        // ============================
        // Sorting
        // ============================

        query = parameters.SortBy.ToLower() switch
        {
            "salary" => parameters.Descending
                ? query.OrderByDescending(x => x.Salary)
                : query.OrderBy(x => x.Salary),

            "title" => parameters.Descending
                ? query.OrderByDescending(x => x.Title)
                : query.OrderBy(x => x.Title),

            _ => query.OrderBy(x => x.Title)
        };

        // ============================
        // Pagination
        // ============================

        var totalCount = await query.CountAsync();

        var jobs = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<JobDto>
        {
            Items = jobs.Select(ToDto).ToList(),

            PageNumber = parameters.PageNumber,

            PageSize = parameters.PageSize,

            TotalCount = totalCount
        };
    }

    public async Task<JobDto?> GetByIdAsync(Guid id)
    {
        var job = await _context.Jobs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return job == null
            ? null
            : ToDto(job);
    }

    public async Task<JobDto> CreateAsync(CreateJobRequest request)
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            CompanyId = request.CompanyId,
            Title = request.Title,
            Description = request.Description,
            Requirements = request.Requirements,
            Salary = request.Salary
        };

        _context.Jobs.Add(job);

        await _context.SaveChangesAsync();

        return ToDto(job);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateJobRequest request)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return false;

        job.CompanyId = request.CompanyId;
        job.Title = request.Title;
        job.Description = request.Description;
        job.Requirements = request.Requirements;
        job.Salary = request.Salary;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return false;

        _context.Jobs.Remove(job);

        await _context.SaveChangesAsync();

        return true;
    }

    private static JobDto ToDto(Job job)
    {
        return new JobDto
        {
            Id = job.Id,
            CompanyId = job.CompanyId,
            Title = job.Title,
            Description = job.Description,
            Requirements = job.Requirements,
            Salary = job.Salary
        };
    }
}