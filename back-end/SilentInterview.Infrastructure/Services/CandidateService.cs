using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.Candidate;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class CandidateService : ICandidateService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public CandidateService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CandidateDto>> GetAllAsync()
    {
        var candidates = await _context.Candidates.ToListAsync();

        return _mapper.Map<List<CandidateDto>>(candidates);
    }

    public async Task<CandidateDto?> GetByIdAsync(Guid id)
    {
        var candidate = await _context.Candidates.FindAsync(id);

        if (candidate == null)
            return null;

        return _mapper.Map<CandidateDto>(candidate);
    }

    public async Task<CandidateDto> CreateAsync(CreateCandidateRequest request)
    {
        var candidate = _mapper.Map<Candidate>(request);

        candidate.Id = Guid.NewGuid();

        _context.Candidates.Add(candidate);

        await _context.SaveChangesAsync();

        return _mapper.Map<CandidateDto>(candidate);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateCandidateRequest request)
    {
        var candidate = await _context.Candidates.FindAsync(id);

        if (candidate == null)
            return false;

        _mapper.Map(request, candidate);

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
}