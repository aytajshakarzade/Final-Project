using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.Recruiter;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class RecruiterService : IRecruiterService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public RecruiterService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RecruiterDto>> GetAllAsync()
    {
        var recruiters = await _context.Recruiters.ToListAsync();

        return _mapper.Map<List<RecruiterDto>>(recruiters);
    }

    public async Task<RecruiterDto?> GetByIdAsync(Guid id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);

        if (recruiter == null)
            return null;

        return _mapper.Map<RecruiterDto>(recruiter);
    }

    public async Task<RecruiterDto> CreateAsync(CreateRecruiterRequest request)
    {
        var recruiter = _mapper.Map<Recruiter>(request);

        recruiter.Id = Guid.NewGuid();

        _context.Recruiters.Add(recruiter);

        await _context.SaveChangesAsync();

        return _mapper.Map<RecruiterDto>(recruiter);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateRecruiterRequest request)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);

        if (recruiter == null)
            return false;

        _mapper.Map(request, recruiter);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);

        if (recruiter == null)
            return false;

        _context.Recruiters.Remove(recruiter);

        await _context.SaveChangesAsync();

        return true;
    }
}