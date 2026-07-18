using Microsoft.AspNetCore.Mvc;
using SilentInterview.Api.Controllers.Base;
using SilentInterview.Application.Common.Responses;
using SilentInterview.Application.DTOs.Auth;
using SilentInterview.Application.Interfaces;

namespace SilentInterview.Api.Controllers;

/// <summary>
/// Authentication operations
/// </summary>
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register new user
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (!result)
        {
            return Failure(
                "Email already exists.",
                StatusCodes.Status400BadRequest);
        }

        return Success(
            true,
            "User registered successfully.");
    }

    /// <summary>
    /// Login
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            return Failure(
                "Invalid email or password.",
                StatusCodes.Status401Unauthorized);
        }

        return Success(
            result,
            "Login successful.");
    }

    /// <summary>
    /// Refresh Access Token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request);

        if (result == null)
        {
            return Failure(
                "Refresh token is invalid or expired.",
                StatusCodes.Status401Unauthorized);
        }

        return Success(
            result,
            "Token refreshed successfully.");
    }

    /// <summary>
    /// Logout
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout(
        LogoutRequest request)
    {
        var result = await _authService.LogoutAsync(request);

        if (!result)
        {
            return Failure(
                "Logout failed.",
                StatusCodes.Status400BadRequest);
        }

        return Success(
            true,
            "Logout successful.");
    }
}