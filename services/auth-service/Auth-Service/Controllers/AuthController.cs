using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Auth_Service.Models;
using Auth_Service.DTOs;
using Auth_Service.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace AuthController.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context; 
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AuthController(UserManager<User> userManager, ApplicationDbContext context, IConfiguration configuration, IPasswordHasher<User> passwordHasher)
        {
            _userManager = userManager;
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }

        [HttpPost("register")]
       public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var userExists = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "El usuario ya existe!" });

 
            User user = new User()
            {
                UserName = model.email,
                Email = model.email,
                PhoneNumber = model.phoneNumber,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, model.password);

            try 
            {
    
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                int roleId = (model.userType == "Provider") ? 2 : 1;

                var userRole = new UserRole 
                { 
                    UserId = user.Id, 
                    RoleId = 1 
                };
                
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();

                // Create user profile in user-service
                try
                {
                    using var httpClient = new HttpClient();
                    
                    // Split full name into first and last name
                    string firstName = "";
                    string lastName = "";
                    if (!string.IsNullOrWhiteSpace(model.fullName))
                    {
                        var nameParts = model.fullName.Trim().Split(' ', 2);
                        firstName = nameParts[0];
                        lastName = nameParts.Length > 1 ? nameParts[1] : "";
                    }
                    
                    var userProfileData = new
                    {
                        user_id = user.Id,
                        first_name = firstName,
                        last_name = lastName,
                        bio = ""
                    };
                    
                    var jsonContent = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(userProfileData),
                        Encoding.UTF8,
                        "application/json"
                    );

                    var userServiceUrl = _configuration["Services:UserService"] ?? "http://localhost:3004";
                    Console.WriteLine($"Creating user profile for userId: {user.Id}, firstName: {firstName}, lastName: {lastName}");
                    Console.WriteLine($"User service URL: {userServiceUrl}/user-profile");
                    
                    var response = await httpClient.PostAsync(
                        $"{userServiceUrl}/user-profile",
                        jsonContent
                    );

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Warning: Failed to create user profile. Status: {response.StatusCode}, Error: {errorContent}");
                    }
                    else
                    {
                        Console.WriteLine($"User profile created successfully for userId: {user.Id}");
                    }
                }
                catch (Exception profileEx)
                {
                    Console.WriteLine($"Warning: Error creating user profile: {profileEx.Message}");
                    // Continue anyway - profile can be created later
                }

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Role, "Client") 
                };

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                return Ok(new 
                { 
                    Status = "Success", 
                    Message = "Usuario creado exitosamente!",
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    userId = user.Id,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { Status = "Error", Message = "Error guardando en BD", Detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
          
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role) 
                .FirstOrDefaultAsync(u => u.Email == model.email);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.password))
            {
                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                };

        
                foreach (var ur in user.UserRoles)
                {
                    if(ur.Role != null) 
                    {
                        authClaims.Add(new Claim(ClaimTypes.Role, ur.Role.Name));
                    }
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                return Ok(new { 
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    userId = user.Id,
                    email = user.Email,
                    userType = user.UserRoles.FirstOrDefault()?.Role?.Name ?? "User"
                });
            }
            return Unauthorized();
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { Status = "Error", Message = "Usuario no encontrado" });

            var providerRequest = await _context.ProviderRequests
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.CreatedAt)
                .FirstOrDefaultAsync();

            var roles = user.UserRoles.Select(ur => ur.Role?.Name?.ToLower()).Where(r => r != null).ToList();
            var userType = roles.Contains("admin") ? "admin" : 
                          roles.Contains("provider") ? "provider" : 
                          roles.FirstOrDefault() ?? "client";

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                userType = userType,
                isActive = user.IsActive,
                providerStatus = providerRequest?.Status,
                profileImageUrl = user.ProfileImageUrl
            });
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { Status = "Error", Message = "Usuario no encontrado" });

            if (!string.IsNullOrEmpty(model.PhoneNumber))
            {
                user.PhoneNumber = model.PhoneNumber;
            }

            if (!string.IsNullOrEmpty(model.ProfileImageUrl))
            {
                user.ProfileImageUrl = model.ProfileImageUrl;
            }

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { Status = "Success", Message = "Perfil actualizado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error actualizando perfil", Detail = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("provider-request")]
        public async Task<IActionResult> CreateProviderRequest([FromBody] ProviderRequestDto model)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new { Status = "Error", Message = "Usuario no encontrado" });

            var isProvider = user.UserRoles.Any(ur => ur.Role?.Name == "Provider");
            if (isProvider)
                return BadRequest(new { Status = "Error", Message = "El usuario ya es un proveedor" });

            var existingRequest = await _context.ProviderRequests
                .Where(pr => pr.UserId == userId && pr.Status == "pending")
                .FirstOrDefaultAsync();

            if (existingRequest != null)
                return BadRequest(new { Status = "Error", Message = "Ya tienes una solicitud pendiente" });

            var providerRequest = new ProviderRequest
            {
                UserId = userId,
                BusinessName = model.BusinessName,
                Description = model.Description,
                Services = model.Services,
                Experience = model.Experience,
                Location = model.Location,
                HourlyRate = model.HourlyRate,
                Portfolio = model.Portfolio,
                Certifications = model.Certifications,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                _context.ProviderRequests.Add(providerRequest);
                await _context.SaveChangesAsync();

                return Ok(new { Status = "Success", Message = "Solicitud enviada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error enviando solicitud", Detail = ex.Message });
            }
        }

        [Authorize(Roles = "admin")]
        [HttpGet("provider-requests")]
        public async Task<IActionResult> GetProviderRequests([FromQuery] string? status = null)
        {
            var query = _context.ProviderRequests
                .Include(pr => pr.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(pr => pr.Status == status);
            }

            var requests = await query
                .OrderByDescending(pr => pr.CreatedAt)
                .Select(pr => new
                {
                    requestId = pr.RequestId,
                    userId = pr.UserId,
                    userEmail = pr.User != null ? pr.User.Email : "",
                    businessName = pr.BusinessName,
                    description = pr.Description,
                    services = pr.Services,
                    experience = pr.Experience,
                    location = pr.Location,
                    hourlyRate = pr.HourlyRate,
                    portfolio = pr.Portfolio,
                    certifications = pr.Certifications,
                    status = pr.Status,
                    createdAt = pr.CreatedAt,
                    reviewedAt = pr.ReviewedAt,
                    reviewNotes = pr.ReviewNotes
                })
                .ToListAsync();

            return Ok(requests);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("provider-requests/review")]
        public async Task<IActionResult> ReviewProviderRequest([FromBody] ReviewProviderRequestDto model)
        {
            var adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var request = await _context.ProviderRequests
                .Include(pr => pr.User)
                .FirstOrDefaultAsync(pr => pr.RequestId == model.RequestId);

            if (request == null)
                return NotFound(new { Status = "Error", Message = "Solicitud no encontrada" });

            if (request.Status != "pending")
                return BadRequest(new { Status = "Error", Message = "Esta solicitud ya fue revisada" });

            request.Status = model.Status;
            request.ReviewedAt = DateTime.UtcNow;
            request.ReviewedBy = adminId;
            request.ReviewNotes = model.ReviewNotes;

            try
            {
                if (model.Status == "approved" && request.User != null)
                {
                    var providerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Provider");
                    
                    if (providerRole != null)
                    {
                        var hasRole = await _context.UserRoles
                            .AnyAsync(ur => ur.UserId == request.UserId && ur.RoleId == providerRole.Id);

                        if (!hasRole)
                        {
                            var userRole = new UserRole
                            {
                                UserId = request.UserId,
                                RoleId = providerRole.Id
                            };
                            _context.UserRoles.Add(userRole);
                        }
                    }

                    // Send push notification to user
                    try
                    {
                        var notificationServiceUrl = _configuration["NotificationService:Url"] ?? "http://localhost:3006";
                        using var httpClient = new HttpClient();
                        
                        var notificationData = new
                        {
                            userId = request.UserId,
                            title = "¡Solicitud Aprobada!",
                            body = "Tu solicitud para ser proveedor ha sido aprobada. Ya puedes ofrecer tus servicios.",
                            data = new
                            {
                                type = "provider_approved",
                                requestId = request.RequestId
                            }
                        };

                        var content = new StringContent(
                            System.Text.Json.JsonSerializer.Serialize(notificationData),
                            Encoding.UTF8,
                            "application/json"
                        );

                        await httpClient.PostAsync($"{notificationServiceUrl}/api/notifications/send", content);
                    }
                    catch (Exception notifEx)
                    {
                        // Log but don't fail the request if notification fails
                        Console.WriteLine($"Error sending notification: {notifEx.Message}");
                    }
                }
                else if (model.Status == "rejected" && request.User != null)
                {
                    // Send rejection notification
                    try
                    {
                        var notificationServiceUrl = _configuration["NotificationService:Url"] ?? "http://localhost:3006";
                        using var httpClient = new HttpClient();
                        
                        var notificationData = new
                        {
                            userId = request.UserId,
                            title = "Solicitud Rechazada",
                            body = model.ReviewNotes ?? "Tu solicitud para ser proveedor ha sido rechazada. Contacta al soporte para más información.",
                            data = new
                            {
                                type = "provider_rejected",
                                requestId = request.RequestId
                            }
                        };

                        var content = new StringContent(
                            System.Text.Json.JsonSerializer.Serialize(notificationData),
                            Encoding.UTF8,
                            "application/json"
                        );

                        await httpClient.PostAsync($"{notificationServiceUrl}/api/notifications/send", content);
                    }
                    catch (Exception notifEx)
                    {
                        Console.WriteLine($"Error sending notification: {notifEx.Message}");
                    }
                }

                _context.ProviderRequests.Update(request);
                await _context.SaveChangesAsync();

                return Ok(new { Status = "Success", Message = "Solicitud revisada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error revisando solicitud", Detail = ex.Message });
            }
        }

        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveCategories()
        {
            try
            {
                var categories = await _context.ServiceCategories
                    .Where(c => c.IsActive)
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
                        ServiceCount = _context.Services.Count(s => s.CategoryId == c.CategoryId && s.IsActive && s.ApprovalStatus == "approved")
                    })
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error obteniendo categorías", Detail = ex.Message });
            }
        }
    }
}