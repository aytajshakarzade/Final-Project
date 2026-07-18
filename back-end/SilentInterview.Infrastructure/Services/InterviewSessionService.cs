using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.InterviewSession;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class InterviewSessionService : IInterviewSessionService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public InterviewSessionService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<InterviewSessionDto>> GetAllAsync()
    {
        var sessions = await _context.InterviewSessions.ToListAsync();

        return _mapper.Map<List<InterviewSessionDto>>(sessions);
    }

    public async Task<InterviewSessionDto?> GetByIdAsync(Guid id)
    {
        var session = await _context.InterviewSessions.FindAsync(id);

        if (session == null)
            return null;

        return _mapper.Map<InterviewSessionDto>(session);
    }

    public async Task<InterviewSessionDto> CreateAsync(CreateInterviewSessionRequest request)
    {
        var session = _mapper.Map<InterviewSession>(request);

        session.Id = Guid.NewGuid();

        _context.InterviewSessions.Add(session);

        await _context.SaveChangesAsync();

        return _mapper.Map<InterviewSessionDto>(session);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateInterviewSessionRequest request)
    {
        var session = await _context.InterviewSessions.FindAsync(id);

        if (session == null)
            return false;

        _mapper.Map(request, session);

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
}