namespace Auth_Service.DTOs
{
    public class ProviderProfileDto
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
    }

    public class UpdateProviderProfileDto
    {
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? YearsExperience { get; set; }
        public int? ServiceRadiusKm { get; set; }
        public bool? AvailableForWork { get; set; }
    }
}
