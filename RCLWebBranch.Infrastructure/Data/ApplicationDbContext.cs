using Microsoft.EntityFrameworkCore;
using RCLWebBranch.DATA.Entities;
//using RCLWebBranch.DATA.Entities;
using System.Reflection;

namespace RCLWebBranch.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
               : base(options)
        {
        }
        public DbSet<T_BRANCH_LOGIN> AppUsers { get; set; }
        public DbSet<T_CLIENT1> T_CLIENTs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        }
    }
}
