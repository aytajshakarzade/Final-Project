using FluentValidation;
using SilentInterview.Application.DTOs.Job;

namespace SilentInterview.Application.Validators.Job;

public class CreateJobRequestValidator : AbstractValidator<CreateJobRequest>
{
    public CreateJobRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .NotEmpty();

        RuleFor(x => x.Requirements)
            .NotEmpty();

        RuleFor(x => x.Salary)
            .GreaterThan(0);

        RuleFor(x => x.CompanyId)
            .NotEmpty();
    }
}