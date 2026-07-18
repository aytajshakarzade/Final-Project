using AutoMapper;
using SilentInterview.Application.DTOs.Company;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Repositories;

namespace SilentInterview.Infrastructure.Services;

public class CompanyService : ICompanyService
{
    private readonly ICompanyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CompanyService(
        ICompanyRepository repository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<CompanyDto>> GetAllAsync()
    {
        var companies = await _repository.GetAllAsync();

        return _mapper.Map<List<CompanyDto>>(companies);
    }

    public async Task<CompanyDto?> GetByIdAsync(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
            return null;

        return _mapper.Map<CompanyDto>(company);
    }

    public async Task<CompanyDto> CreateAsync(CreateCompanyRequest request)
    {
        var company = _mapper.Map<Company>(request);

        company.Id = Guid.NewGuid();

        await _repository.AddAsync(company);

        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CompanyDto>(company);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateCompanyRequest request)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
            return false;

        _mapper.Map(request, company);

        _repository.Update(company);

        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
            return false;

        _repository.Delete(company);

        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}