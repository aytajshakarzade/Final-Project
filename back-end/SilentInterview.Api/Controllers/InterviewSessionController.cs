using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.DTOs.InterviewSession;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Interview Session Management
/// </summary>
[Authorize]
[Route("api/[controller]")]
public class InterviewSessionController : BaseApiController
{
    private readonly IInterviewSessionService _service;

    public InterviewSessionController(
        IInterviewSessionService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all interview sessions
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await _service.GetAllAsync();

        return Success(
            sessions,
            "Interview sessions retrieved successfully.");
    }

    /// <summary>
    /// Get interview session by id
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var session = await _service.GetByIdAsync(id);

        if (session == null)
        {
            return Failure(
                "Interview session not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            session,
            "Interview session retrieved successfully.");
    }

    /// <summary>
    /// Create interview session
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateInterviewSessionRequest request)
    {
        var session = await _service.CreateAsync(request);

        return Success(
            session,
            "Interview session created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update interview session
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateInterviewSessionRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Interview session not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Interview session updated successfully.");
    }

    /// <summary>
    /// Delete interview session
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Interview session not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Interview session deleted successfully.");
    }
}