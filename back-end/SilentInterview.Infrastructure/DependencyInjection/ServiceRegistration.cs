using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SilentInterview.Application.Interfaces;
using SilentInterview.Application.Mappings;
using SilentInterview.Infrastructure.Persistence;
using SilentInterview.Infrastructure.Repositories;
using SilentInterview.Infrastructure.Services;

namespace SilentInterview.Infrastructure.DependencyInjection;

public static class ServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ==========================
        // Database
        // ==========================
        services.AddDbContext<SilentInterviewDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"));
        });

        // ==========================
        // AutoMapper
        // ==========================
        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        // ==========================
        // Authentication
        // ==========================
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();

        // ==========================
        // Unit Of Work
        // ==========================
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();


        // ==========================
        // Generic Repository
        // ==========================
        services.AddScoped(typeof(IGenericRepository<>),
                           typeof(GenericRepository<>));

        // ==========================
        // Business Services
        // ==========================
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<ICandidateService, CandidateService>();
        services.AddScoped<IRecruiterService, RecruiterService>();
        services.AddScoped<IJobApplicationService, JobApplicationService>();
        services.AddScoped<IInterviewSessionService, InterviewSessionService>();
        services.AddScoped<IInterviewAnswerService, InterviewAnswerService>();
        services.AddScoped<IReportService, ReportService>();

        return services;
    }
}