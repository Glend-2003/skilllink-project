namespace Auth_Service.Models
{
    public class Service
    {
        public int ServiceId { get; set; }
        public int ProviderId { get; set; }
        public int CategoryId { get; set; }
        public string ServiceTitle { get; set; } = string.Empty;
        public string ServiceDescription { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public string PriceType { get; set; } = "fixed"; // fixed, hourly, negotiable
        public int? EstimatedDurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string ApprovalStatus { get; set; } = "pending"; // pending, approved, rejected
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? VerificationDate { get; set; }

        // Navigation properties
        public ProviderProfile Provider { get; set; } = null!;
        public ServiceCategory Category { get; set; } = null!;
    }
}
