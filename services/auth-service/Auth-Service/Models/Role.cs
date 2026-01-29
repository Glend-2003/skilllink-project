using System.ComponentModel.DataAnnotations.Schema;

namespace Auth_Service.Models
{
    [Table("roles")]
    public class Role
    {
        [Column("role_id")]
        public int Id { get; set; }

        [Column("role_name")]
        public string Name { get; set; }

        public ICollection<UserRole> UserRoles { get; set; }
    }
}