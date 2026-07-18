using FluentValidation;
using SilentInterview.Application.DTOs.Auth;

namespace SilentInterview.Application.Validators.Auth;

public class RegisterRequestValidator
    : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]")
            .WithMessage("Password must contain an uppercase letter.")
            .Matches("[a-z]")
            .WithMessage("Password must contain a lowercase letter.")
            .Matches("[0-9]")
            .WithMessage("Password must contain a number.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match.");
    }
}