using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Recruiter;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Recruiter Management
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class RecruiterController : BaseApiController
{
    private readonly IRecruiterService _recruiterService;

    public RecruiterController(IRecruiterService recruiterService)
    {
        _recruiterService = recruiterService;
    }

    /// <summary>
    /// Get all recruiters.
    /// Supports pagination, filtering and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] RecruiterQueryParameters parameters)
    {
        var recruiters = await _recruiterService.GetAllAsync(parameters);

        return Success(
            recruiters,
            "Recruiters retrieved successfully.");
    }

    /// <summary>
    /// Get recruiter by id.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var recruiter = await _recruiterService.GetByIdAsync(id);

        if (recruiter == null)
        {
            return Failure(
                "Recruiter not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            recruiter,
            "Recruiter retrieved successfully.");
    }

    /// <summary>
    /// Create recruiter.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateRecruiterRequest request)
    {
        var recruiter = await _recruiterService.CreateAsync(request);

        return Success(
            recruiter,
            "Recruiter created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update recruiter.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateRecruiterRequest request)
    {
        var updated = await _recruiterService.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Recruiter not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Recruiter updated successfully.");
    }

    /// <summary>
    /// Delete recruiter.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _recruiterService.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Recruiter not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Recruiter deleted successfully.");
    }
}