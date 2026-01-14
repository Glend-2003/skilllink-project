using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Auth_Service.Models;

namespace Auth_Service.Data
{
    // Usamos IdentityUserContext para no arrastrar las tablas basura de Identity
    public class ApplicationDbContext : IdentityUserContext<User, int>
    {
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; } // Agregamos la tabla intermedia

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. Mapeo User
            builder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.Property(e => e.Id).HasColumnName("user_id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number");
                
                // Ignoramos lo que no tienes
                entity.Ignore(e => e.NormalizedEmail);
                entity.Ignore(e => e.NormalizedUserName);
                entity.Ignore(e => e.EmailConfirmed);
                entity.Ignore(e => e.PhoneNumberConfirmed);
                entity.Ignore(e => e.SecurityStamp);
                entity.Ignore(e => e.ConcurrencyStamp);
                entity.Ignore(e => e.LockoutEnabled);
                entity.Ignore(e => e.LockoutEnd);
                entity.Ignore(e => e.AccessFailedCount);
                entity.Ignore(e => e.UserName);
                entity.Ignore(e => e.TwoFactorEnabled);
            });

            // 2. Mapeo Role
            builder.Entity<Role>().ToTable("roles");

            // 3. MAPEO DE LA TABLA INTERMEDIA (user_roles)
            builder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                entity.HasKey(ur => new { ur.UserId, ur.RoleId }); // Clave compuesta

                // Relación con User
                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId);

                // Relación con Role
                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId);
            });
        }
    }
}