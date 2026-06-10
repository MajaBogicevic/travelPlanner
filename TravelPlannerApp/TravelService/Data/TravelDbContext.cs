using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using TravelService.Models;

namespace TravelService.Data
{
    public class TravelDbContext : DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options) : base(options) { }

        public DbSet<TravelPlan> TravelPlans => Set<TravelPlan>();
        public DbSet<Destination> Destinations => Set<Destination>();
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<Expense> Expenses => Set<Expense>();
        public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
        public DbSet<SharedPlan> SharedPlans => Set<SharedPlan>();
        public DbSet<PlanAccess> PlanAccesses => Set<PlanAccess>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            b.Entity<TravelPlan>().HasMany(t => t.Destinations)
                .WithOne(d => d.TravelPlan).HasForeignKey(d => d.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TravelPlan>().HasMany(t => t.Activities)
                .WithOne(a => a.TravelPlan).HasForeignKey(a => a.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TravelPlan>().HasMany(t => t.Expenses)
                .WithOne(e => e.TravelPlan).HasForeignKey(e => e.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TravelPlan>().HasMany(t => t.ChecklistItems)
                .WithOne(c => c.TravelPlan).HasForeignKey(c => c.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TravelPlan>().HasMany(t => t.SharedPlans)
                .WithOne(s => s.TravelPlan).HasForeignKey(s => s.TravelPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Entity<TravelPlan>().Property(t => t.Budget).HasPrecision(18, 2);
            b.Entity<Expense>().Property(e => e.Amount).HasPrecision(18, 2);
            b.Entity<Activity>().Property(a => a.EstimatedCost).HasPrecision(18, 2);

            b.Entity<TravelPlan>().HasMany(t => t.PlanAccesses)
            .WithOne(a => a.TravelPlan).HasForeignKey(a => a.TravelPlanId)
            .OnDelete(DeleteBehavior.Cascade);
        }
    }
}