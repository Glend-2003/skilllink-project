using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auth_Service.Models
{
    [Table("provider_requests")]
    public class ProviderRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("business_name")]
        [Required]
        [MaxLength(200)]
        public string BusinessName { get; set; } = string.Empty;

        [Column("description")]
        [Required]
        public string Description { get; set; } = string.Empty;

        [Column("services")]
        [Required]
        public string Services { get; set; } = string.Empty;

        [Column("experience")]
        [MaxLength(500)]
        public string? Experience { get; set; }

        [Column("location")]
        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Column("hourly_rate")]
        public decimal? HourlyRate { get; set; }

        [Column("portfolio")]
        public string? Portfolio { get; set; }

        [Column("certifications")]
        public string? Certifications { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reviewed_by")]
        public int? ReviewedBy { get; set; }

        [Column("review_notes")]
        public string? ReviewNotes { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
