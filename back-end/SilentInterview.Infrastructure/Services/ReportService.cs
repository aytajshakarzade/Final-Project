using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.Report;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IMapper _mapper;

    public ReportService(
        SilentInterviewDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ReportDto>> GetAllAsync()
    {
        var reports = await _context.Reports.ToListAsync();

        return _mapper.Map<List<ReportDto>>(reports);
    }

    public async Task<ReportDto?> GetByIdAsync(Guid id)
    {
        var report = await _context.Reports.FindAsync(id);

        if (report == null)
            return null;

        return _mapper.Map<ReportDto>(report);
    }

    public async Task<ReportDto> CreateAsync(CreateReportRequest request)
    {
        var report = _mapper.Map<Report>(request);

        report.Id = Guid.NewGuid();
        report.CreatedAt = DateTime.UtcNow;

        _context.Reports.Add(report);

        await _context.SaveChangesAsync();

        return _mapper.Map<ReportDto>(report);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateReportRequest request)
    {
        var report = await _context.Reports.FindAsync(id);

        if (report == null)
            return false;

        _mapper.Map(request, report);

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
}