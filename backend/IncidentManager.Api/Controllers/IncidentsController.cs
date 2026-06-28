using IncidentManager.Api.Data;
using IncidentManager.Api.DTOs;
using IncidentManager.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IncidentManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<IncidentsController> _logger;

    public IncidentsController(AppDbContext context, ILogger<IncidentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Incident>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? severity)
    {
        var query = _context.Incidents.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(i => i.Status.ToString() == status);
        }

        if (!string.IsNullOrWhiteSpace(severity))
        {
            query = query.Where(i => i.Severity.ToString() == severity);
        }

        var incidents = await query
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        _logger.LogInformation("Listagem de incidentes realizada. Total: {Total}", incidents.Count);

        return Ok(incidents);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Incident>> GetById(Guid id)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            _logger.LogWarning("Incidente não encontrado. Id: {IncidentId}", id);
            return NotFound(new { message = "Incidente não encontrado." });
        }

        return Ok(incident);
    }

    [HttpPost]
    public async Task<ActionResult<Incident>> Create(CreateIncidentRequest request)
    {
        var incident = new Incident
        {
            Title = request.Title,
            Description = request.Description,
            Severity = request.Severity,
            Status = Enums.IncidentStatus.Aberto
        };

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Incidente criado com sucesso. Id: {IncidentId}, Severidade: {Severity}",
            incident.Id,
            incident.Severity
        );

        return CreatedAtAction(nameof(GetById), new { id = incident.Id }, incident);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Incident>> Update(Guid id, UpdateIncidentRequest request)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            _logger.LogWarning("Tentativa de atualizar incidente inexistente. Id: {IncidentId}", id);
            return NotFound(new { message = "Incidente não encontrado." });
        }

        incident.Title = request.Title;
        incident.Description = request.Description;
        incident.Severity = request.Severity;
        incident.Status = request.Status;
        incident.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Incidente atualizado com sucesso. Id: {IncidentId}", id);

        return Ok(incident);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<Incident>> UpdateStatus(Guid id, UpdateIncidentStatusRequest request)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            _logger.LogWarning("Tentativa de alterar status de incidente inexistente. Id: {IncidentId}", id);
            return NotFound(new { message = "Incidente não encontrado." });
        }

        incident.Status = request.Status;
        incident.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Status do incidente alterado. Id: {IncidentId}, NovoStatus: {Status}",
            id,
            request.Status
        );

        return Ok(incident);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var incident = await _context.Incidents.FindAsync(id);

        if (incident is null)
        {
            _logger.LogWarning("Tentativa de remover incidente inexistente. Id: {IncidentId}", id);
            return NotFound(new { message = "Incidente não encontrado." });
        }

        _context.Incidents.Remove(incident);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Incidente removido com sucesso. Id: {IncidentId}", id);

        return NoContent();
    }
}