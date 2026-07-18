using Microsoft.EntityFrameworkCore;
using SilentInterview.Domain.Entities;
using SilentInterview.Infrastructure.Persistence.Configurations;

namespace SilentInterview.Infrastructure.Persistence;

public class SilentInterviewDbContext : DbContext
{
    public SilentInterviewDbContext(
        DbContextOptions<SilentInterviewDbContext> options)
        : base(options)
    {
    }

    // Authentication
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Company
    public DbSet<Company> Companies => Set<Company>();

    // Recruiter
    public DbSet<Recruiter> Recruiters => Set<Recruiter>();

    // Candidate
    public DbSet<Candidate> Candidates => Set<Candidate>();

    // Job
    public DbSet<Job> Jobs => Set<Job>();

    // Job Application
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    // Interview
    public DbSet<InterviewSession> InterviewSessions => Set<InterviewSession>();
    public DbSet<InterviewAnswer> InterviewAnswers => Set<InterviewAnswer>();

    // Reports
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurations
        modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());

        // User
        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        // Recruiter -> Company
        modelBuilder.Entity<Recruiter>()
            .HasOne(x => x.Company)
            .WithMany(x => x.Recruiters)
            .HasForeignKey(x => x.CompanyId);

        // Candidate -> User
        modelBuilder.Entity<Candidate>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId);

        // Job -> Company
        modelBuilder.Entity<Job>()
            .HasOne(x => x.Company)
            .WithMany(x => x.Jobs)
            .HasForeignKey(x => x.CompanyId);

        // JobApplication -> Job
        modelBuilder.Entity<JobApplication>()
            .HasOne(x => x.Job)
            .WithMany(x => x.Applications)
            .HasForeignKey(x => x.JobId);

        // JobApplication -> Candidate
        modelBuilder.Entity<JobApplication>()
            .HasOne(x => x.Candidate)
            .WithMany()
            .HasForeignKey(x => x.CandidateId);

        // InterviewSession -> JobApplication
        modelBuilder.Entity<InterviewSession>()
            .HasOne(x => x.JobApplication)
            .WithMany(x => x.InterviewSessions)
            .HasForeignKey(x => x.JobApplicationId);

        // InterviewAnswer -> InterviewSession
        modelBuilder.Entity<InterviewAnswer>()
            .HasOne(x => x.InterviewSession)
            .WithMany(x => x.Answers)
            .HasForeignKey(x => x.InterviewSessionId);

        // RefreshToken -> User
        modelBuilder.Entity<RefreshToken>()
            .HasOne(x => x.User)
            .WithMany(x => x.RefreshTokens)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}