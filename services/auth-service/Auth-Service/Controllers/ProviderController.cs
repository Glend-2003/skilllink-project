using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Auth_Service.Data;
using Auth_Service.DTOs;
using Auth_Service.Models;
using System.Security.Claims;

namespace Auth_Service.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProviderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProviderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/provider/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProviderProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            Console.WriteLine($"[ProviderController] GetProviderProfile: userId = {userId}");

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                Console.WriteLine($"[ProviderController] Provider profile not found for userId = {userId}");
                return NotFound(new { message = "Provider profile not found" });
            }

            Console.WriteLine($"[ProviderController] Found profile: provider_id = {profile.ProviderId}, business = {profile.BusinessName}");

            var dto = new ProviderProfileDto
            {
                ProviderId = profile.ProviderId,
                UserId = profile.UserId,
                BusinessName = profile.BusinessName,
                BusinessDescription = profile.BusinessDescription,
                Latitude = profile.Latitude,
                Longitude = profile.Longitude,
                YearsExperience = profile.YearsExperience,
                ServiceRadiusKm = profile.ServiceRadiusKm,
                IsVerified = profile.IsVerified,
                VerificationDate = profile.VerificationDate,
                TrustBadge = profile.TrustBadge,
                AvailableForWork = profile.AvailableForWork
            };

            return Ok(dto);
        }

        // PUT: api/provider/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProviderProfile([FromBody] UpdateProviderProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            Console.WriteLine($"[ProviderController] UpdateProviderProfile: userId = {userId}");

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                Console.WriteLine($"[ProviderController] Provider profile not found for userId = {userId}");
                profile = new ProviderProfile
                {
                    UserId = userId,
                    BusinessName = dto.BusinessName ?? "Mi Negocio",
                    BusinessDescription = dto.BusinessDescription,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    YearsExperience = dto.YearsExperience,
                    ServiceRadiusKm = dto.ServiceRadiusKm,
                    AvailableForWork = dto.AvailableForWork ?? true,
                    IsVerified = false,
                    TrustBadge = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.ProviderProfiles.Add(profile);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[ProviderController] Created new profile: provider_id = {profile.ProviderId}");
                return Ok(new { message = "Provider profile created successfully" });
            }

            Console.WriteLine($"[ProviderController] Updating profile: provider_id = {profile.ProviderId}");

            if (dto.BusinessName != null) profile.BusinessName = dto.BusinessName;
            if (dto.BusinessDescription != null) profile.BusinessDescription = dto.BusinessDescription;
            if (dto.Latitude.HasValue) profile.Latitude = dto.Latitude.Value;
            if (dto.Longitude.HasValue) profile.Longitude = dto.Longitude.Value;
            if (dto.YearsExperience.HasValue) profile.YearsExperience = dto.YearsExperience.Value;
            if (dto.ServiceRadiusKm.HasValue) profile.ServiceRadiusKm = dto.ServiceRadiusKm.Value;
            if (dto.AvailableForWork.HasValue) profile.AvailableForWork = dto.AvailableForWork.Value;

            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Provider profile updated successfully" });
        }

        // GET: api/provider/services
        [HttpGet("services")]
        public async Task<IActionResult> GetMyServices()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Provider profile not found" });

            var services = await _context.Services
                .Include(s => s.Category)
                .Where(s => s.ProviderId == profile.ProviderId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new ServiceDto
                {
                    ServiceId = s.ServiceId,
                    ProviderId = s.ProviderId,
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
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(services);
        }

        // POST: api/provider/services
        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return BadRequest(new { message = "User is not a provider" });

            var categoryExists = await _context.ServiceCategories
                .AnyAsync(c => c.CategoryId == dto.CategoryId && c.IsActive);

            if (!categoryExists)
                return BadRequest(new { message = "Invalid category ID" });

            var service = new Service
            {
                ProviderId = profile.ProviderId,
                CategoryId = dto.CategoryId,
                ServiceTitle = dto.ServiceTitle,
                ServiceDescription = dto.ServiceDescription,
                BasePrice = dto.BasePrice,
                PriceType = dto.PriceType,
                EstimatedDurationMinutes = dto.EstimatedDurationMinutes,
                IsActive = dto.IsActive,
                ApprovalStatus = "pending", 
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsVerified = false
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service created successfully", serviceId = service.ServiceId });
        }

        // PUT: api/provider/services/{id}
        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return BadRequest(new { message = "User is not a provider" });

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.ServiceId == id && s.ProviderId == profile.ProviderId);

            if (service == null)
                return NotFound(new { message = "Service not found or not owned by you" });

            if (dto.CategoryId.HasValue)
            {
                var categoryExists = await _context.ServiceCategories
                    .AnyAsync(c => c.CategoryId == dto.CategoryId.Value && c.IsActive);
                if (!categoryExists)
                    return BadRequest(new { message = "Invalid category ID" });
                service.CategoryId = dto.CategoryId.Value;
            }

            if (dto.ServiceTitle != null) service.ServiceTitle = dto.ServiceTitle;
            if (dto.ServiceDescription != null) service.ServiceDescription = dto.ServiceDescription;
            if (dto.BasePrice.HasValue) service.BasePrice = dto.BasePrice.Value;
            if (dto.PriceType != null) service.PriceType = dto.PriceType;
            if (dto.EstimatedDurationMinutes.HasValue) service.EstimatedDurationMinutes = dto.EstimatedDurationMinutes.Value;
            if (dto.IsActive.HasValue) service.IsActive = dto.IsActive.Value;

            service.ApprovalStatus = "pending";
            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Service updated successfully" });
        }

        // DELETE: api/provider/services/{id}
        [HttpDelete("services/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (userId == 0) return Unauthorized();

            var profile = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return BadRequest(new { message = "User is not a provider" });

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.ServiceId == id && s.ProviderId == profile.ProviderId);

            if (service == null)
                return NotFound(new { message = "Service not found or not owned by you" });

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Service deleted successfully" });
        }

        // GET: api/provider/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ServiceCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.CategoryName)
                .Select(c => new ServiceCategoryDto
                {
                    CategoryId = c.CategoryId,
                    ParentCategoryId = c.ParentCategoryId,
                    CategoryName = c.CategoryName,
                    CategoryDescription = c.CategoryDescription,
                    IconUrl = c.IconUrl,
                    IsActive = c.IsActive,
                    DisplayOrder = c.DisplayOrder
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}
