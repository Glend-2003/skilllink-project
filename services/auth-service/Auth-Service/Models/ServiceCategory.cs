namespace Auth_Service.Models
{
    public class ServiceCategory
    {
        public int CategoryId { get; set; }
        public int? ParentCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public string? IconUrl { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public ServiceCategory? ParentCategory { get; set; }
        public ICollection<ServiceCategory> SubCategories { get; set; } = new List<ServiceCategory>();
        public ICollection<Service> Services { get; set; } = new List<Service>();
    }
}
