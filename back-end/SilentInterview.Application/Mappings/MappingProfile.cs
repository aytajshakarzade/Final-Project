using AutoMapper;
using SilentInterview.Application.DTOs.Candidate;
using SilentInterview.Application.DTOs.Company;
using SilentInterview.Application.DTOs.InterviewAnswer;
using SilentInterview.Application.DTOs.InterviewSession;
using SilentInterview.Application.DTOs.Job;
using SilentInterview.Application.DTOs.JobApplication;
using SilentInterview.Application.DTOs.Recruiter;
using SilentInterview.Application.DTOs.Report;
using SilentInterview.Domain.Entities;

namespace SilentInterview.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Company
        CreateMap<Company, CompanyDto>().ReverseMap();
        CreateMap<CreateCompanyRequest, Company>();
        CreateMap<UpdateCompanyRequest, Company>();

        // Job
        CreateMap<Job, JobDto>().ReverseMap();
        CreateMap<CreateJobRequest, Job>();
        CreateMap<UpdateJobRequest, Job>();

        // Candidate
        CreateMap<Candidate, CandidateDto>().ReverseMap();
        CreateMap<CreateCandidateRequest, Candidate>();
        CreateMap<UpdateCandidateRequest, Candidate>();

        // Recruiter
        CreateMap<Recruiter, RecruiterDto>().ReverseMap();
        CreateMap<CreateRecruiterRequest, Recruiter>();
        CreateMap<UpdateRecruiterRequest, Recruiter>();

        // JobApplication
        CreateMap<JobApplication, JobApplicationDto>().ReverseMap();
        CreateMap<CreateJobApplicationRequest, JobApplication>();
        CreateMap<UpdateJobApplicationRequest, JobApplication>();

        // InterviewSession
        CreateMap<InterviewSession, InterviewSessionDto>().ReverseMap();
        CreateMap<CreateInterviewSessionRequest, InterviewSession>();
        CreateMap<UpdateInterviewSessionRequest, InterviewSession>();

        // InterviewAnswer
        CreateMap<InterviewAnswer, InterviewAnswerDto>().ReverseMap();
        CreateMap<CreateInterviewAnswerRequest, InterviewAnswer>();
        CreateMap<UpdateInterviewAnswerRequest, InterviewAnswer>();

        // Report
        CreateMap<Report, ReportDto>().ReverseMap();
        CreateMap<CreateReportRequest, Report>();
        CreateMap<UpdateReportRequest, Report>();
    }
}