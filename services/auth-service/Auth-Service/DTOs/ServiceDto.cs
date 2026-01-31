namespace Auth_Service.DTOs
{
    public class ServiceDto
    {
        public int ServiceId { get; set; }
        public int ProviderId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string ServiceTitle { get; set; } = string.Empty;
        public string ServiceDescription { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public string PriceType { get; set; } = "fixed";
        public int? EstimatedDurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string ApprovalStatus { get; set; } = "pending";
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateServiceDto
    {
        public int CategoryId { get; set; }
        public string ServiceTitle { get; set; } = string.Empty;
        public string ServiceDescription { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public string PriceType { get; set; } = "fixed";
        public int? EstimatedDurationMinutes { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateServiceDto
    {
        public int? CategoryId { get; set; }
        public string? ServiceTitle { get; set; }
        public string? ServiceDescription { get; set; }
        public decimal? BasePrice { get; set; }
        public string? PriceType { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ServiceCategoryDto
    {
        public int CategoryId { get; set; }
        public int? ParentCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }
}
