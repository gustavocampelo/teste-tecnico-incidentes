using System.ComponentModel.DataAnnotations;
using IncidentManager.Api.Enums;

namespace IncidentManager.Api.DTOs;

public class UpdateIncidentRequest
{
    [Required(ErrorMessage = "O título é obrigatório.")]
    [MinLength(3, ErrorMessage = "O título deve ter pelo menos 3 caracteres.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "A descrição é obrigatória.")]
    [MinLength(10, ErrorMessage = "A descrição deve ter pelo menos 10 caracteres.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "A severidade é obrigatória.")]
    public IncidentSeverity Severity { get; set; }

    [Required(ErrorMessage = "O status é obrigatório.")]
    public IncidentStatus Status { get; set; }
}