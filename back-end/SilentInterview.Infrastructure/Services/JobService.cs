using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.Job;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public JobService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<JobDto>> GetAllAsync()
    {
        var jobs = await _context.Jobs.ToListAsync();

        return _mapper.Map<List<JobDto>>(jobs);
    }

    public async Task<JobDto?> GetByIdAsync(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return null;

        return _mapper.Map<JobDto>(job);
    }

    public async Task<JobDto> CreateAsync(CreateJobRequest request)
    {
        var job = _mapper.Map<Job>(request);

        job.Id = Guid.NewGuid();

        _context.Jobs.Add(job);

        await _context.SaveChangesAsync();

        return _mapper.Map<JobDto>(job);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateJobRequest request)
    {
        var job = await _context.Jobs.FindAsync(id);

        if (job == null)
            return false;

        _mapper.Map(request, job);

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
}