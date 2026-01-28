namespace Auth_Service.Models
{
    public class ProviderProfile
    {
        public int ProviderId { get; set; }
        public int UserId { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? YearsExperience { get; set; }
        public int? ServiceRadiusKm { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? VerificationDate { get; set; }
        public bool TrustBadge { get; set; }
        public bool AvailableForWork { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public User User { get; set; } = null!;
    }
}
