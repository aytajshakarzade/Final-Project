namespace SilentInterview.Application.DTOs.InterviewSession;

public class CreateInterviewSessionRequest
{
    public Guid JobApplicationId { get; set; }

    public DateTime StartedAt { get; set; }
}