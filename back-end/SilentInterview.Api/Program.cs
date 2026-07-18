using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SilentInterview.Api.Middleware;
using SilentInterview.Application.Common.Interfaces;
using SilentInterview.Application.Settings;
using SilentInterview.Application.Validators.Auth;
using SilentInterview.Infrastructure.AI;
using SilentInterview.Infrastructure.DependencyInjection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// Controllers
// ======================================================
builder.Services.AddControllers();
builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();
builder.Services.AddHttpClient<IWhisperService, WhisperService>();

// ======================================================
// FluentValidation
// ======================================================
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();

builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

// ======================================================
// JWT Settings (Options Pattern)
// ======================================================
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

// ======================================================
// Infrastructure
// ======================================================
builder.Services.AddInfrastructure(builder.Configuration);

// ======================================================
// Authentication
// ======================================================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;

        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,

            ValidateAudience = true,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,

            ClockSkew = TimeSpan.Zero,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!))
        };
    });

// ======================================================
// Authorization
// ======================================================
builder.Services.AddAuthorization();

// ======================================================
// CORS
// ======================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ======================================================
// Swagger
// ======================================================
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SilentInterview API",
        Version = "v1",
        Description = "Enterprise Recruitment Platform API"
    });

    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter: Bearer {token}"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Id = "Bearer",
                        Type = ReferenceType.SecurityScheme
                    }
                },
                Array.Empty<string>()
            }
        });
});

var app = builder.Build();

// ======================================================
// Middleware Pipeline
// ======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseGlobalException();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();