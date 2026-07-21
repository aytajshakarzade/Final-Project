using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Candidate;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class CandidateService : ICandidateService
{
    private readonly SilentInterviewDbContext _context;

    public CandidateService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CandidateDto>> GetAllAsync(
        CandidateQueryParameters parameters)
    {
        IQueryable<Candidate> query = _context.Candidates.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();

            query = query.Where(x =>
                x.Skills.Contains(search) ||
                x.Education.Contains(search) ||
                x.Experience.Contains(search));
        }

        // Filter by UserId
        if (parameters.UserId.HasValue)
        {
            query = query.Where(x =>
                x.UserId == parameters.UserId.Value);
        }

        // Filter by Skill
        if (!string.IsNullOrWhiteSpace(parameters.Skill))
        {
            query = query.Where(x =>
                x.Skills.Contains(parameters.Skill));
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "skills" => parameters.Descending
                ? query.OrderByDescending(x => x.Skills)
                : query.OrderBy(x => x.Skills),

            "education" => parameters.Descending
                ? query.OrderByDescending(x => x.Education)
                : query.OrderBy(x => x.Education),

            "experience" => parameters.Descending
                ? query.OrderByDescending(x => x.Experience)
                : query.OrderBy(x => x.Experience),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Id)
                : query.OrderBy(x => x.Id)
        };

        var totalCount = await query.CountAsync();

        var candidates = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<CandidateDto>
        {
            Items = candidates.Select(ToDto).ToList(),
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<CandidateDto?> GetByIdAsync(Guid id)
    {
        var candidate = await _context.Candidates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return candidate == null
            ? null
            : ToDto(candidate);
    }

    public async Task<CandidateDto> CreateAsync(CreateCandidateRequest request)
    {
        var candidate = new Candidate
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            ResumeUrl = request.ResumeUrl,
            Skills = request.Skills,
            Education = request.Education,
            Experience = request.Experience
        };

        _context.Candidates.Add(candidate);

        await _context.SaveChangesAsync();

        return ToDto(candidate);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateCandidateRequest request)
    {
        var candidate = await _context.Candidates.FindAsync(id);

        if (candidate == null)
            return false;

        candidate.ResumeUrl = request.ResumeUrl;
        candidate.Skills = request.Skills;
        candidate.Education = request.Education;
        candidate.Experience = request.Experience;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var candidate = await _context.Candidates.FindAsync(id);

        if (candidate == null)
            return false;

        _context.Candidates.Remove(candidate);

        await _context.SaveChangesAsync();

        return true;
    }

    private static CandidateDto ToDto(Candidate candidate)
    {
        return new CandidateDto
        {
            Id = candidate.Id,
            UserId = candidate.UserId,
            ResumeUrl = candidate.ResumeUrl,
            Skills = candidate.Skills,
            Education = candidate.Education,
            Experience = candidate.Experience
        };
    }
}