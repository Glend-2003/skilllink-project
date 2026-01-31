using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Auth_Service.Data;
using Auth_Service.DTOs;
using Auth_Service.Models;
using System.Security.Claims;

namespace Auth_Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<bool> IsAdmin()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return false;

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.UserRoles.Any(ur => ur.Role.Name == "admin") ?? false;
        }

        // GET: api/admin/services/pending
        [HttpGet("services/pending")]
        public async Task<IActionResult> GetPendingServices()
        {
            if (!await IsAdmin())
                return Forbid();

            var services = await _context.Services
                .Include(s => s.Category)
                .Include(s => s.Provider)
                .ThenInclude(p => p.User)
                .Where(s => s.ApprovalStatus == "pending")
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    ServiceId = s.ServiceId,
                    ProviderId = s.ProviderId,
                    ProviderBusinessName = s.Provider.BusinessName,
                    ProviderEmail = s.Provider.User.Email,
                    CategoryId = s.CategoryId,
                    CategoryName = s.Category.CategoryName,
                    ServiceTitle = s.ServiceTitle,
                    ServiceDescription = s.ServiceDescription,
                    BasePrice = s.BasePrice,
                    PriceType = s.PriceType,
                    EstimatedDurationMinutes = s.EstimatedDurationMinutes,
                    IsActive = s.IsActive,
                    ApprovalStatus = s.ApprovalStatus,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            return Ok(services);
        }

        // GET: api/admin/services/all
        [HttpGet("services/all")]
        public async Task<IActionResult> GetAllServices([FromQuery] string? status = null)
        {
            if (!await IsAdmin())
                return Forbid();

            var query = _context.Services
                .Include(s => s.Category)
                .Include(s => s.Provider)
                .ThenInclude(p => p.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(s => s.ApprovalStatus == status);
            }

            var services = await query
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    ServiceId = s.ServiceId,
                    ProviderId = s.ProviderId,
                    ProviderBusinessName = s.Provider.BusinessName,
                    ProviderEmail = s.Provider.User.Email,
                    CategoryId = s.CategoryId,
                    CategoryName = s.Category.CategoryName,
                    ServiceTitle = s.ServiceTitle,
                    ServiceDescription = s.ServiceDescription,
                    BasePrice = s.BasePrice,
                    PriceType = s.PriceType,
                    EstimatedDurationMinutes = s.EstimatedDurationMinutes,
                    IsActive = s.IsActive,
                    ApprovalStatus = s.ApprovalStatus,
                    IsVerified = s.IsVerified,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            return Ok(services);
        }

        // PUT: api/admin/services/{id}/approve
        [HttpPut("services/{id}/approve")]
        public async Task<IActionResult> ApproveService(int id)
        {
            if (!await IsAdmin())
                return Forbid();

            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound(new { message = "Service not found" });

            service.ApprovalStatus = "approved";
            service.IsActive = true; 
            service.IsVerified = true;
            service.VerificationDate = DateTime.UtcNow;
            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Service approved successfully" });
        }

        // PUT: api/admin/services/{id}/reject
        [HttpPut("services/{id}/reject")]
        public async Task<IActionResult> RejectService(int id, [FromBody] RejectServiceDto dto)
        {
            if (!await IsAdmin())
                return Forbid();

            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound(new { message = "Service not found" });

            service.ApprovalStatus = "rejected";
            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Service rejected successfully", reason = dto.Reason });
        }

        // GET: api/admin/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            if (!await IsAdmin())
                return Forbid();

            var categories = await _context.ServiceCategories
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.CategoryName)
                .Select(c => new
                {
                    CategoryId = c.CategoryId,
                    CategoryName = c.CategoryName,
                    CategoryDescription = c.CategoryDescription,
                    IconUrl = c.IconUrl,
                    IsActive = c.IsActive,
                    DisplayOrder = c.DisplayOrder,
                    ParentCategoryId = c.ParentCategoryId,
                    CreatedAt = c.CreatedAt,
                    ServiceCount = _context.Services.Count(s => s.CategoryId == c.CategoryId)
                })
                .ToListAsync();

            return Ok(categories);
        }

        // POST: api/admin/categories
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDto dto)
        {
            if (!await IsAdmin())
                return Forbid();

            var category = new ServiceCategory
            {
                CategoryName = dto.CategoryName,
                CategoryDescription = dto.CategoryDescription,
                IconUrl = dto.IconUrl,
                IsActive = dto.IsActive ?? true,
                DisplayOrder = dto.DisplayOrder ?? 0,
                ParentCategoryId = dto.ParentCategoryId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category created successfully", categoryId = category.CategoryId });
        }

        // PUT: api/admin/categories/{id}
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            if (!await IsAdmin())
                return Forbid();

            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            category.CategoryName = dto.CategoryName;
            category.CategoryDescription = dto.CategoryDescription;
            category.IconUrl = dto.IconUrl;
            category.IsActive = dto.IsActive ?? category.IsActive;
            category.DisplayOrder = dto.DisplayOrder ?? category.DisplayOrder;
            category.ParentCategoryId = dto.ParentCategoryId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Category updated successfully" });
        }

        // DELETE: api/admin/categories/{id}
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            if (!await IsAdmin())
                return Forbid();

            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            var hasServices = await _context.Services.AnyAsync(s => s.CategoryId == id);
            if (hasServices)
                return BadRequest(new { message = "Cannot delete category with associated services" });

            _context.ServiceCategories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category deleted successfully" });
        }

        // PUT: api/admin/categories/{id}/toggle
        [HttpPut("categories/{id}/toggle")]
        public async Task<IActionResult> ToggleCategoryStatus(int id)
        {
            if (!await IsAdmin())
                return Forbid();

            var category = await _context.ServiceCategories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            category.IsActive = !category.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category status updated", isActive = category.IsActive });
        }
    }

    public class RejectServiceDto
    {
        public string? Reason { get; set; }
    }
    public class CategoryDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public string? CategoryDescription { get; set; }
        public string? IconUrl { get; set; }
        public bool? IsActive { get; set; }
        public int? DisplayOrder { get; set; }
        public int? ParentCategoryId { get; set; }
    }
}
