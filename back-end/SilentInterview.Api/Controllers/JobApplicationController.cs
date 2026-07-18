using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.DTOs.JobApplication;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Job Application Management
/// </summary>
[Authorize]
[Route("api/[controller]")]
public class JobApplicationController : BaseApiController
{
    private readonly IJobApplicationService _jobApplicationService;

    public JobApplicationController(
        IJobApplicationService jobApplicationService)
    {
        _jobApplicationService = jobApplicationService;
    }

    /// <summary>
    /// Get all applications
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications =
            await _jobApplicationService.GetAllAsync();

        return Success(
            applications,
            "Applications retrieved successfully.");
    }

    /// <summary>
    /// Get application by id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var application =
            await _jobApplicationService.GetByIdAsync(id);

        if (application == null)
        {
            return Failure(
                "Application not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            application,
            "Application retrieved successfully.");
    }

    /// <summary>
    /// Create application
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateJobApplicationRequest request)
    {
        var application =
            await _jobApplicationService.CreateAsync(request);

        return Success(
            application,
            "Application created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update application
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateJobApplicationRequest request)
    {
        var updated =
            await _jobApplicationService.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Application not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Application updated successfully.");
    }

    /// <summary>
    /// Delete application
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted =
            await _jobApplicationService.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Application not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Application deleted successfully.");
    }
}