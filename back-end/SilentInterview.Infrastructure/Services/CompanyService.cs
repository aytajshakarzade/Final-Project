using Microsoft.EntityFrameworkCore;

using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Company;
using SilentInterview.Application.Interfaces;

using SilentInterview.Domain.Entities;

using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class CompanyService : ICompanyService
{
    private readonly SilentInterviewDbContext _context;

    public CompanyService(SilentInterviewDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CompanyDto>> GetAllAsync(
        CompanyQueryParameters parameters)
    {
        IQueryable<Company> query = _context.Companies.AsNoTracking();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.Description.Contains(search) ||
                x.Website.Contains(search) ||
                x.Industry.Contains(search));
        }

        // Industry Filter
        if (!string.IsNullOrWhiteSpace(parameters.Industry))
        {
            query = query.Where(x =>
                x.Industry.Contains(parameters.Industry));
        }

        // Sorting
        query = parameters.SortBy.ToLower() switch
        {
            "name" => parameters.Descending
                ? query.OrderByDescending(x => x.Name)
                : query.OrderBy(x => x.Name),

            "industry" => parameters.Descending
                ? query.OrderByDescending(x => x.Industry)
                : query.OrderBy(x => x.Industry),

            "website" => parameters.Descending
                ? query.OrderByDescending(x => x.Website)
                : query.OrderBy(x => x.Website),

            _ => parameters.Descending
                ? query.OrderByDescending(x => x.Name)
                : query.OrderBy(x => x.Name)
        };

        var totalCount = await query.CountAsync();

        var companies = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return new PagedResult<CompanyDto>
        {
            Items = companies.Select(ToDto).ToList(),
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize,
            TotalCount = totalCount
        };
    }

    public async Task<CompanyDto?> GetByIdAsync(Guid id)
    {
        var company = await _context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return company == null
            ? null
            : ToDto(company);
    }

    public async Task<CompanyDto> CreateAsync(CreateCompanyRequest request)
    {
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Industry = request.Industry,
            Description = request.Description,
            Website = request.Website
        };

        _context.Companies.Add(company);

        await _context.SaveChangesAsync();

        return ToDto(company);
    }

    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateCompanyRequest request)
    {
        var company = await _context.Companies.FindAsync(id);

        if (company == null)
            return false;

        company.Name = request.Name;
        company.Industry = request.Industry;
        company.Description = request.Description;
        company.Website = request.Website;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var company = await _context.Companies.FindAsync(id);

        if (company == null)
            return false;

        _context.Companies.Remove(company);

        await _context.SaveChangesAsync();

        return true;
    }

    private static CompanyDto ToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Industry = company.Industry,
            Description = company.Description,
            Website = company.Website
        };
    }
}