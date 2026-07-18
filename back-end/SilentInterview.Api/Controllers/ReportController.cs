using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.DTOs.Report;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Report Management
/// </summary>
[Authorize]
[Route("api/[controller]")]
public class ReportController : BaseApiController
{
    private readonly IReportService _service;

    public ReportController(
        IReportService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all reports
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reports = await _service.GetAllAsync();

        return Success(
            reports,
            "Reports retrieved successfully.");
    }

    /// <summary>
    /// Get report by id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var report = await _service.GetByIdAsync(id);

        if (report == null)
        {
            return Failure(
                "Report not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            report,
            "Report retrieved successfully.");
    }

    /// <summary>
    /// Create report
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateReportRequest request)
    {
        var report = await _service.CreateAsync(request);

        return Success(
            report,
            "Report created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update report
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateReportRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Report not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Report updated successfully.");
    }

    /// <summary>
    /// Delete report
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Report not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Report deleted successfully.");
    }
}