namespace Auth_Service.DTOs
{
    public class ProviderRequestDto
    {
        public string BusinessName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Services { get; set; } = string.Empty;
        public string? Experience { get; set; }
        public string Location { get; set; } = string.Empty;
        public decimal? HourlyRate { get; set; }
        public string? Portfolio { get; set; }
        public string? Certifications { get; set; }
    }

    public class ReviewProviderRequestDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; } = string.Empty; // approved, rejected
        public string? ReviewNotes { get; set; }
    }
}
