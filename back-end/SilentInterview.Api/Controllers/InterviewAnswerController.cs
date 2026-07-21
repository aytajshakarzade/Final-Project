using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Models;
using SilentInterview.Application.DTOs.InterviewAnswer;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Interview Answer Management
/// </summary>
[Authorize]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class InterviewAnswerController : BaseApiController
{
    private readonly IInterviewAnswerService _service;

    public InterviewAnswerController(
        IInterviewAnswerService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all interview answers.
    /// Supports pagination, filtering, searching and sorting.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] InterviewAnswerQueryParameters parameters)
    {
        var answers = await _service.GetAllAsync(parameters);

        return Success(
            answers,
            "Interview answers retrieved successfully.");
    }

    /// <summary>
    /// Get interview answer by id.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var answer = await _service.GetByIdAsync(id);

        if (answer == null)
        {
            return Failure(
                "Interview answer not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            answer,
            "Interview answer retrieved successfully.");
    }

    /// <summary>
    /// Create interview answer.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        CreateInterviewAnswerRequest request)
    {
        var answer = await _service.CreateAsync(request);

        return Success(
            answer,
            "Interview answer created successfully.",
            StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update interview answer.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateInterviewAnswerRequest request)
    {
        var updated = await _service.UpdateAsync(id, request);

        if (!updated)
        {
            return Failure(
                "Interview answer not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Interview answer updated successfully.");
    }

    /// <summary>
    /// Delete interview answer.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);

        if (!deleted)
        {
            return Failure(
                "Interview answer not found.",
                StatusCodes.Status404NotFound);
        }

        return Success(
            true,
            "Interview answer deleted successfully.");
    }
}