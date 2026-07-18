using SilentInterview.Domain.Common;

namespace SilentInterview.Domain.Entities;

public class User : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public Role Role { get; set; }

    public bool EmailConfirmed { get; set; }


    public bool IsActive { get; set; } = true;

    // Enterprise Refresh Tokens
    public ICollection<RefreshToken> RefreshTokens { get; set; }
        = new List<RefreshToken>();
}