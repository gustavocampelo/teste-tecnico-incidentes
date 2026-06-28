using System.ComponentModel.DataAnnotations;
using IncidentManager.Api.Enums;

namespace IncidentManager.Api.DTOs;

public class UpdateIncidentStatusRequest
{
    [Required(ErrorMessage = "O status é obrigatório.")]
    public IncidentStatus Status { get; set; }
}