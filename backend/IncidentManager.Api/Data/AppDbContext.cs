using IncidentManager.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IncidentManager.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Incident> Incidents => Set<Incident>();
}