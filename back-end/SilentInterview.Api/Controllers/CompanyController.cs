using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Company;
using Asp.Versioning;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Company Management
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class CompanyController : BaseApiController
{
    private readonly ICompanyService _companyService;

    public CompanyController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    /// <summary>
    /// Get all companies
    /// Supports pagination, search, filtering and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] CompanyQueryParameters parameters)
    {
        var companies = await _companyService.GetAllAsync(parameters);

        return Success(
            companies,
            "Companies retrieved successfully.");
    }

    /// <summary>
    /// Get company by id
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var company = await _companyService.GetByIdAsync(id);

        if (company == null)
        {
            return Failure(
                "Company not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            company,
            "Company retrieved successfully.");
    }

    /// <summary>
    /// Create company
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateCompanyRequest request)
    {
        var company = await _companyService.CreateAsync(request);

        return Success(
            company,
            "Company created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update company
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCompanyRequest request)
    {
        var updated = await _companyService.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Company not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Company updated successfully.");
    }

    /// <summary>
    /// Delete company
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _companyService.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Company not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Company deleted successfully.");
    }
}