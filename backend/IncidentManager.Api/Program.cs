using IncidentManager.Api.Data;
using IncidentManager.Api.Enums;
using IncidentManager.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>()
    ?? new[]
    {
        "http://localhost:5173",
        "https://gustavocampelo.github.io"
    };

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    dbContext.Database.EnsureCreated();

    if (!dbContext.Incidents.Any())
    {
        var now = DateTime.UtcNow;

        dbContext.Incidents.AddRange(
            new Incident
            {
                Title = "Erro ao carregar painel administrativo",
                Description = "Usuário relata que o painel fica carregando indefinidamente ao informar o CNPJ.",
                Severity = IncidentSeverity.Alta,
                Status = IncidentStatus.Aberto,
                CreatedAt = now.AddMinutes(-45),
                UpdatedAt = now.AddMinutes(-45)
            },
            new Incident
            {
                Title = "Falha ao salvar formulário de cadastro",
                Description = "O sistema não conclui o salvamento do formulário e não apresenta mensagem clara ao usuário.",
                Severity = IncidentSeverity.Media,
                Status = IncidentStatus.EmAnalise,
                CreatedAt = now.AddHours(-2),
                UpdatedAt = now.AddMinutes(-30)
            },
            new Incident
            {
                Title = "Lentidão na listagem de registros",
                Description = "A listagem apresenta tempo de resposta elevado em determinados horários de maior uso.",
                Severity = IncidentSeverity.Baixa,
                Status = IncidentStatus.Resolvido,
                CreatedAt = now.AddDays(-1),
                UpdatedAt = now.AddHours(-4)
            }
        );

        dbContext.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/", () => Results.Ok(new
{
    application = "Incident Manager API",
    status = "Running",
    documentation = "/api/incidents"
}));

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow
}));

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();