using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Candidate;
using SilentInterview.Application.Interfaces;
using Asp.Versioning;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Candidate Management
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class CandidateController : BaseApiController
{
    private readonly ICandidateService _candidateService;

    public CandidateController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    /// <summary>
    /// Get all candidates
    /// Supports pagination, search, filtering and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] CandidateQueryParameters parameters)
    {
        var candidates = await _candidateService.GetAllAsync(parameters);

        return Success(
            candidates,
            "Candidates retrieved successfully.");
    }

    /// <summary>
    /// Get candidate by id
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var candidate = await _candidateService.GetByIdAsync(id);

        if (candidate == null)
        {
            return Failure(
                "Candidate not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            candidate,
            "Candidate retrieved successfully.");
    }

    /// <summary>
    /// Create candidate
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateCandidateRequest request)
    {
        var candidate = await _candidateService.CreateAsync(request);

        return Success(
            candidate,
            "Candidate created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update candidate
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCandidateRequest request)
    {
        var updated = await _candidateService.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Candidate not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Candidate updated successfully.");
    }

    /// <summary>
    /// Delete candidate
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _candidateService.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Candidate not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Candidate deleted successfully.");
    }
}