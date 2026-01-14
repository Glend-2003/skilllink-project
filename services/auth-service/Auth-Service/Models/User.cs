using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auth_Service.Models
{
    [Table("users")]
    public class User : IdentityUser<int>
    {
        [Column("user_id")]
        public override int Id { get; set; }

        [Column("email")]
        public override string Email { get; set; }

        [Column("password_hash")]
        public override string PasswordHash { get; set; }

        [Column("phone_number")]
        public override string PhoneNumber { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- RELACIÓN CORRECTA (3 Tablas) ---
        // Quitamos RoleId directo. Ahora es una lista a través de la tabla intermedia.
        public ICollection<UserRole> UserRoles { get; set; } 
    }
}