using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Auth_Service.Models;

namespace Auth_Service.Data
{
    public class ApplicationDbContext : IdentityUserContext<User, int>
    {
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; } 
        public DbSet<ProviderRequest> ProviderRequests { get; set; }
        public DbSet<ProviderProfile> ProviderProfiles { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<ServiceCategory> ServiceCategories { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. Mapping User
            builder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.Property(e => e.Id).HasColumnName("user_id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number");
                
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

            // 2. Mapping Role
            builder.Entity<Role>().ToTable("roles");

            // 3. MAPPING THE INTERMEDIARY TABLE (user_roles)
            builder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                entity.HasKey(ur => new { ur.UserId, ur.RoleId }); // Composite key
                // Relationship with User
                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId);

                // Relationship with Role
                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId);
            });

            builder.Entity<ProviderProfile>(entity =>
            {
                entity.ToTable("provider_profiles");
                entity.HasKey(e => e.ProviderId);
                entity.Property(e => e.ProviderId).HasColumnName("provider_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.BusinessName).HasColumnName("business_name");
                entity.Property(e => e.BusinessDescription).HasColumnName("business_description");
                entity.Property(e => e.Latitude).HasColumnName("latitude");
                entity.Property(e => e.Longitude).HasColumnName("longitude");
                entity.Property(e => e.YearsExperience).HasColumnName("years_experience");
                entity.Property(e => e.ServiceRadiusKm).HasColumnName("service_radius_km");
                entity.Property(e => e.IsVerified).HasColumnName("is_verified");
                entity.Property(e => e.VerificationDate).HasColumnName("verification_date");
                entity.Property(e => e.TrustBadge).HasColumnName("trust_badge");
                entity.Property(e => e.AvailableForWork).HasColumnName("available_for_work");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId);
            });

            builder.Entity<ServiceCategory>(entity =>
            {
                entity.ToTable("service_categories");
                entity.HasKey(e => e.CategoryId);
                entity.Property(e => e.CategoryId).HasColumnName("category_id");
                entity.Property(e => e.ParentCategoryId).HasColumnName("parent_category_id");
                entity.Property(e => e.CategoryName).HasColumnName("category_name");
                entity.Property(e => e.CategoryDescription).HasColumnName("category_description");
                entity.Property(e => e.IconUrl).HasColumnName("icon_url");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.DisplayOrder).HasColumnName("display_order");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");

                entity.HasOne(e => e.ParentCategory)
                    .WithMany(e => e.SubCategories)
                    .HasForeignKey(e => e.ParentCategoryId);
            });

            builder.Entity<Service>(entity =>
            {
                entity.ToTable("services");
                entity.HasKey(e => e.ServiceId);
                entity.Property(e => e.ServiceId).HasColumnName("service_id");
                entity.Property(e => e.ProviderId).HasColumnName("provider_id");
                entity.Property(e => e.CategoryId).HasColumnName("category_id");
                entity.Property(e => e.ServiceTitle).HasColumnName("service_title");
                entity.Property(e => e.ServiceDescription).HasColumnName("service_description");
                entity.Property(e => e.BasePrice).HasColumnName("base_price");
                entity.Property(e => e.PriceType).HasColumnName("price_type");
                entity.Property(e => e.EstimatedDurationMinutes).HasColumnName("estimated_duration_minutes");
                entity.Property(e => e.IsActive).HasColumnName("is_active");
                entity.Property(e => e.ApprovalStatus).HasColumnName("approval_status");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.IsVerified).HasColumnName("is_verified");
                entity.Property(e => e.VerificationDate).HasColumnName("verification_date");

                entity.HasOne(e => e.Provider)
                    .WithMany()
                    .HasForeignKey(e => e.ProviderId);

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Services)
                    .HasForeignKey(e => e.CategoryId);
            });
        }
    }
}