using AuthService.Models;
using AuthService.Models.TravelService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
    }
}