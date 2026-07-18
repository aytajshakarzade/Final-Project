using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.JobApplication;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public JobApplicationService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<JobApplicationDto>> GetAllAsync()
    {
        var applications = await _context.JobApplications.ToListAsync();

        return _mapper.Map<List<JobApplicationDto>>(applications);
    }

    public async Task<JobApplicationDto?> GetByIdAsync(Guid id)
    {
        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
            return null;

        return _mapper.Map<JobApplicationDto>(application);
    }

    public async Task<JobApplicationDto> CreateAsync(CreateJobApplicationRequest request)
    {
        var application = _mapper.Map<JobApplication>(request);

        application.Id = Guid.NewGuid();

        _context.JobApplications.Add(application);

        await _context.SaveChangesAsync();

        return _mapper.Map<JobApplicationDto>(application);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateJobApplicationRequest request)
    {
        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
            return false;

        _mapper.Map(request, application);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
            return false;

        _context.JobApplications.Remove(application);

        await _context.SaveChangesAsync();

        return true;
    }
}