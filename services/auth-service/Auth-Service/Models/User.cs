using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthService.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        public int user_id { get; set; }
        
        [Required]
        public string email { get; set; }
        
        [Required]
        public string password_hash { get; set; }
        
        public string? phone_number { get; set; }
        
        public string? profile_image_url { get; set; } 
        
        public bool is_active { get; set; } = true;
        
        public bool email_verified { get; set; } = false; 
        
        public DateTime created_at { get; set; } = DateTime.Now;
        
        public DateTime? last_login { get; set; }
    }
}