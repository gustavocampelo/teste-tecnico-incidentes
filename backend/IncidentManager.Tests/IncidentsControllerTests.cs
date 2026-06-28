using System.ComponentModel.DataAnnotations;
using IncidentManager.Api.Controllers;
using IncidentManager.Api.Data;
using IncidentManager.Api.DTOs;
using IncidentManager.Api.Enums;
using IncidentManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace IncidentManager.Tests;

public class IncidentsControllerTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static IncidentsController CreateController(AppDbContext context)
    {
        return new IncidentsController(
            context,
            new NullLogger<IncidentsController>()
        );
    }

    [Fact]
    public async Task Create_DeveCriarIncidenteValido()
    {
        var context = CreateContext();
        var controller = CreateController(context);

        var request = new CreateIncidentRequest
        {
            Title = "Erro ao carregar painel",
            Description = "O painel administrativo fica carregando indefinidamente.",
            Severity = IncidentSeverity.Alta
        };

        var result = await controller.Create(request);

        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var incident = Assert.IsType<Incident>(createdResult.Value);

        Assert.Equal(request.Title, incident.Title);
        Assert.Equal(request.Description, incident.Description);
        Assert.Equal(IncidentSeverity.Alta, incident.Severity);
        Assert.Equal(IncidentStatus.Aberto, incident.Status);
        Assert.Single(context.Incidents);
    }

    [Fact]
    public void CreateIncidentRequest_NaoDeveSerValidoSemTitulo()
    {
        var request = new CreateIncidentRequest
        {
            Title = "",
            Description = "Descrição válida para teste de validação.",
            Severity = IncidentSeverity.Media
        };

        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(request);

        var isValid = Validator.TryValidateObject(
            request,
            validationContext,
            validationResults,
            validateAllProperties: true
        );

        Assert.False(isValid);
        Assert.Contains(validationResults, result =>
            result.ErrorMessage == "O título é obrigatório."
        );
    }

    [Fact]
    public async Task GetAll_DeveRetornarIncidentesCadastrados()
    {
        var context = CreateContext();

        context.Incidents.Add(new Incident
        {
            Title = "Erro de login",
            Description = "Usuário não consegue acessar o sistema.",
            Severity = IncidentSeverity.Media
        });

        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.GetAll(null, null);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var incidents = Assert.IsAssignableFrom<IEnumerable<Incident>>(okResult.Value);

        Assert.Single(incidents);
    }

    [Fact]
    public async Task GetById_DeveRetornarNotFoundQuandoIncidenteNaoExiste()
    {
        var context = CreateContext();
        var controller = CreateController(context);

        var result = await controller.GetById(Guid.NewGuid());

        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Update_DeveAtualizarIncidenteExistente()
    {
        var context = CreateContext();

        var incident = new Incident
        {
            Title = "Erro antigo",
            Description = "Descrição antiga do incidente.",
            Severity = IncidentSeverity.Baixa,
            Status = IncidentStatus.Aberto
        };

        context.Incidents.Add(incident);
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var request = new UpdateIncidentRequest
        {
            Title = "Erro atualizado",
            Description = "Descrição atualizada do incidente.",
            Severity = IncidentSeverity.Critica,
            Status = IncidentStatus.EmAnalise
        };

        var result = await controller.Update(incident.Id, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updatedIncident = Assert.IsType<Incident>(okResult.Value);

        Assert.Equal("Erro atualizado", updatedIncident.Title);
        Assert.Equal("Descrição atualizada do incidente.", updatedIncident.Description);
        Assert.Equal(IncidentSeverity.Critica, updatedIncident.Severity);
        Assert.Equal(IncidentStatus.EmAnalise, updatedIncident.Status);
    }

    [Fact]
    public async Task UpdateStatus_DeveAtualizarStatusDoIncidente()
    {
        var context = CreateContext();

        var incident = new Incident
        {
            Title = "Erro no formulário",
            Description = "Formulário apresenta erro ao salvar os dados.",
            Severity = IncidentSeverity.Alta,
            Status = IncidentStatus.Aberto
        };

        context.Incidents.Add(incident);
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var request = new UpdateIncidentStatusRequest
        {
            Status = IncidentStatus.Resolvido
        };

        var result = await controller.UpdateStatus(incident.Id, request);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var updatedIncident = Assert.IsType<Incident>(okResult.Value);

        Assert.Equal(IncidentStatus.Resolvido, updatedIncident.Status);
    }

    [Fact]
    public async Task Delete_DeveRemoverIncidenteExistente()
    {
        var context = CreateContext();

        var incident = new Incident
        {
            Title = "Erro para exclusão",
            Description = "Incidente utilizado para validar exclusão.",
            Severity = IncidentSeverity.Media,
            Status = IncidentStatus.Aberto
        };

        context.Incidents.Add(incident);
        await context.SaveChangesAsync();

        var controller = CreateController(context);

        var result = await controller.Delete(incident.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(context.Incidents);
    }
}