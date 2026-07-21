using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.Job;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Job Management
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class JobController : BaseApiController
{
    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    /// <summary>
    /// Get all jobs
    /// Supports pagination, search, filtering and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] JobQueryParameters parameters)
    {
        var jobs = await _jobService.GetAllAsync(parameters);

        return Success(
            jobs,
            "Jobs retrieved successfully.");
    }

    /// <summary>
    /// Get job by id
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await _jobService.GetByIdAsync(id);

        if (job == null)
        {
            return Failure(
                "Job not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            job,
            "Job retrieved successfully.");
    }

    /// <summary>
    /// Create job
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateJobRequest request)
    {
        var job = await _jobService.CreateAsync(request);

        return Success(
            job,
            "Job created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update job
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateJobRequest request)
    {
        var updated = await _jobService.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Job not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Job updated successfully.");
    }

    /// <summary>
    /// Delete job
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _jobService.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Job not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Job deleted successfully.");
    }
}