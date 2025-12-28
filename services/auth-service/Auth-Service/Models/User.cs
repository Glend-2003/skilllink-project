using System.ComponentModel.DataAnnotations;

namespace AuthService.Models
{
    public class User
    {
        [Key]
        public int user_id { get; set; }
        public string email { get; set; }
        public string password_hash { get; set; }
        public string? phone_number { get; set; }
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.Now;
    }
}