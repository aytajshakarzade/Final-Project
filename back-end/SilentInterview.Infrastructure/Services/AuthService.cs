using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SilentInterview.Application.DTOs.Auth;
using SilentInterview.Application.Interfaces;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence;

namespace SilentInterview.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly SilentInterviewDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthService(
        SilentInterviewDbContext context,
        IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    #region Register

    public async Task<bool> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var exists = await _context.Users
            .AnyAsync(x => x.Email == email);

        if (exists)
            return false;

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = Enum.Parse<Role>(request.Role, true),
            EmailConfirmed = false,
            IsActive = true
        };

        await _context.Users.AddAsync(user);

        await _context.SaveChangesAsync();

        return true;
    }

    #endregion

    #region Login

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var user = await _context.Users

            .Include(x => x.RefreshTokens)

            .FirstOrDefaultAsync(x => x.Email == email);

        if (user == null)
            return null;

        if (!user.IsActive)
            return null;

        var validPassword = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash);

        if (!validPassword)
            return null;

        //--------------------------------------------------
        // ACCESS TOKEN
        //--------------------------------------------------

        var accessToken =
            _jwtService.GenerateAccessToken(
                user.Id,
                user.FullName,
                user.Email,
                user.Role.ToString());

        //--------------------------------------------------
        // REFRESH TOKEN
        //--------------------------------------------------

        var refreshTokenValue =
            _jwtService.GenerateRefreshToken();

        var refreshTokenExpiry =
            _jwtService.GetRefreshTokenExpiry();

        //--------------------------------------------------
        // REMOVE OLD TOKENS
        //--------------------------------------------------

        foreach (var token in user.RefreshTokens
                     .Where(x => x.IsActive))
        {
            token.IsRevoked = true;
        }

        //--------------------------------------------------
        // CREATE NEW TOKEN
        //--------------------------------------------------

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),

            Token = refreshTokenValue,

            UserId = user.Id,

            Expires = refreshTokenExpiry,

            IsRevoked = false,

            CreatedAt = DateTime.UtcNow
        };

        await _context.RefreshTokens.AddAsync(
            refreshToken);

        await _context.SaveChangesAsync();

        //--------------------------------------------------
        // RETURN
        //--------------------------------------------------

        return new AuthResponse
        {
            UserId = user.Id,

            FullName = user.FullName,

            Email = user.Email,

            Role = user.Role.ToString(),

            AccessToken = accessToken,

            RefreshToken = refreshToken.Token,

            AccessTokenExpiresAt =
                DateTime.UtcNow.AddMinutes(15),

            RefreshTokenExpiresAt =
                refreshToken.Expires
        };
    }

    #endregion

    #region Refresh Token

    public async Task<AuthResponse?> RefreshTokenAsync(
        RefreshTokenRequest request)
    {
        var refreshToken = await _context.RefreshTokens

            .Include(x => x.User)

            .FirstOrDefaultAsync(x =>
                x.Token == request.RefreshToken);

        if (refreshToken == null)
            return null;

        if (!refreshToken.IsActive)
            return null;

        if (!refreshToken.User.IsActive)
            return null;

        //--------------------------------------------------
        // REVOKE OLD TOKEN
        //--------------------------------------------------

        refreshToken.IsRevoked = true;

        //--------------------------------------------------
        // CREATE NEW ACCESS TOKEN
        //--------------------------------------------------

        var accessToken =
            _jwtService.GenerateAccessToken(
                refreshToken.User.Id,
                refreshToken.User.FullName,
                refreshToken.User.Email,
                refreshToken.User.Role.ToString());

        //--------------------------------------------------
        // CREATE NEW REFRESH TOKEN
        //--------------------------------------------------

        var newRefreshToken =
            new RefreshToken
            {
                Id = Guid.NewGuid(),

                UserId = refreshToken.UserId,

                Token = _jwtService.GenerateRefreshToken(),

                Expires = _jwtService.GetRefreshTokenExpiry(),

                IsRevoked = false,

                CreatedAt = DateTime.UtcNow
            };

        await _context.RefreshTokens.AddAsync(
            newRefreshToken);

        await _context.SaveChangesAsync();

        //--------------------------------------------------
        // RETURN
        //--------------------------------------------------

        return new AuthResponse
        {
            UserId = refreshToken.User.Id,

            FullName = refreshToken.User.FullName,

            Email = refreshToken.User.Email,

            Role = refreshToken.User.Role.ToString(),

            AccessToken = accessToken,

            RefreshToken = newRefreshToken.Token,

            AccessTokenExpiresAt =
                DateTime.UtcNow.AddMinutes(15),

            RefreshTokenExpiresAt =
                newRefreshToken.Expires
        };
    }

    #endregion

    #region Logout

    public async Task<bool> LogoutAsync(
        LogoutRequest request)
    {
        var refreshToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(x =>
                x.Token == request.RefreshToken);

        if (refreshToken == null)
            return false;

        refreshToken.IsRevoked = true;

        await _context.SaveChangesAsync();

        return true;
    }

    #endregion
}
