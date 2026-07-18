using FluentValidation;
using SilentInterview.Application.DTOs.InterviewSession;

namespace SilentInterview.Application.Validators.InterviewSession;

public class CreateInterviewSessionRequestValidator
    : AbstractValidator<CreateInterviewSessionRequest>
{
    public CreateInterviewSessionRequestValidator()
    {
        RuleFor(x => x.JobApplicationId)
            .NotEmpty();

        RuleFor(x => x.StartedAt)
            .NotEmpty();
    }
}