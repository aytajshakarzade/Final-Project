using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.DTOs.InterviewAnswer;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Interview Answer Management
/// </summary>
[Authorize]
[Route("api/[controller]")]
public class InterviewAnswerController : BaseApiController
{
    private readonly IInterviewAnswerService _service;

    public InterviewAnswerController(
        IInterviewAnswerService service)
    {
        _service = service;
    }

    /// <summary>
    /// Get all interview answers
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var answers = await _service.GetAllAsync();

        return Success(
            answers,
            "Interview answers retrieved successfully.");
    }

    /// <summary>
    /// Get interview answer by id
    /// </summary>
    [HttpGet("{id:guid}")]
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
    /// Create interview answer
    /// </summary>
    [HttpPost]
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
    /// Update interview answer
    /// </summary>
    [HttpPut("{id:guid}")]
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
    /// Delete interview answer
    /// </summary>
    [HttpDelete("{id:guid}")]
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