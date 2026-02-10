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
        private readonly IHttpClientFactory _httpClientFactory;
        public AuthController(UserManager<User> userManager, ApplicationDbContext context, IConfiguration configuration, IPasswordHasher<User> passwordHasher, IHttpClientFactory httpClientFactory)
        {
            _userManager = userManager;
            _context = context;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
            _httpClientFactory = httpClientFactory;
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


                await SendNotificationAsync(user.Id, user.Email, "WELCOME",
    "¡Bienvenido a SkillLink!",
    "Gracias por registrarte. Estamos felices de tenerte con nosotros.",
    "User", user.Id);

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
                    if (ur.Role != null)
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

                await SendNotificationAsync(user.Id, user.Email, "LOGIN_SECURITY",
    "Nuevo inicio de sesión detectado",
    $"Hola, se ha detectado un inicio de sesión en tu cuenta el {DateTime.Now:dd/MM/yyyy HH:mm}. Si no fuiste tú, contacta a soporte.",
    "User", user.Id);

                return Ok(new
                {
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
                        await SendNotificationAsync(
    request.UserId,
    request.User.Email,
    "PROVIDER_APPROVAL",
    "¡Solicitud Aprobada!",
    "Tu solicitud para ser proveedor en SkillLink ha sido aprobada. ¡Bienvenido a bordo!",
    "ProviderRequest",
    request.RequestId
);
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
                        await SendNotificationAsync(
    request.UserId,
    request.User.Email,
    "PROVIDER_REJECTION",
    "Solicitud de Proveedor",
    "Tu solicitud ha sido rechazada. Notas: " + model.ReviewNotes,
    "ProviderRequest",
    request.RequestId
);
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);

            if (user == null)
            {
                // Don't reveal that the user doesn't exist for security reasons
                return Ok(new { Status = "Success", Message = "Si el correo existe, recibirás un código de recuperación" });
            }

            // Generate a 6-digit code
            var random = new Random();
            var code = random.Next(100000, 999999).ToString();

            // Store the code and set expiration (15 minutes)
            user.ResetPasswordCode = code;
            user.ResetCodeExpiration = DateTime.UtcNow.AddMinutes(15);

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                // Send email with the code via notification service
                try
                {
                    using var httpClient = new HttpClient();
                    var notificationServiceUrl = _configuration["Services:NotificationService"] ?? "http://localhost:3006";

                    var emailData = new
                    {
                        to = user.Email,
                        subject = "Recuperar Contraseña - SkillLink",
                        code = code,
                        type = "password-reset"
                    };

                    var jsonContent = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(emailData),
                        Encoding.UTF8,
                        "application/json"
                    );

                    var response = await httpClient.PostAsync(
                        $"{notificationServiceUrl}/api/notifications/send-email",
                        jsonContent
                    );

                    if (response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"✅ Recovery email sent to {user.Email}");
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"⚠️ Failed to send email: {errorContent}");
                        Console.WriteLine($"📧 Recovery code for {user.Email}: {code}");
                    }
                }
                catch (Exception emailEx)
                {
                    // Log but don't fail - user can still recover if we log the code
                    Console.WriteLine($"⚠️ Error sending email: {emailEx.Message}");
                    Console.WriteLine($"📧 Recovery code for {user.Email}: {code}");
                }

                return Ok(new { Status = "Success", Message = "Si el correo existe, recibirás un código de recuperación" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error procesando solicitud", Detail = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);

            if (user == null)
            {
                return BadRequest(new { Status = "Error", Message = "Código inválido o expirado" });
            }

            // Check if code matches and is not expired
            if (string.IsNullOrEmpty(user.ResetPasswordCode) ||
                user.ResetPasswordCode != model.code ||
                user.ResetCodeExpiration == null ||
                user.ResetCodeExpiration < DateTime.UtcNow)
            {
                return BadRequest(new { Status = "Error", Message = "Código inválido o expirado" });
            }

            // Update password
            user.PasswordHash = _passwordHasher.HashPassword(user, model.newPassword);
            user.ResetPasswordCode = null;
            user.ResetCodeExpiration = null;
            user.SecurityStamp = Guid.NewGuid().ToString();

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { Status = "Success", Message = "Contraseña actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "Error actualizando contraseña", Detail = ex.Message });
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

        private async Task SendNotificationAsync(int userId, string email, string type, string title, string message, string entityType, int entityId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient();
                
                // Send push notification
                var pushPayload = new
                {
                    userId = userId,
                    userEmail = email,
                    type = type,
                    title = title,
                    message = message,
                    entityType = entityType,
                    entityId = entityId
                };

                await client.PostAsJsonAsync("http://notification_service:3006/api/notifications/send", pushPayload);

                // Send email notification
                var notificationServiceUrl = _configuration["Services:NotificationService"] ?? "http://notification_service:3006";
                
                var emailPayload = new
                {
                    to = email,
                    subject = title,
                    html = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset='utf-8'>
                            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                        </head>
                        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
                            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                                <tr>
                                    <td align='center'>
                                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                                            <tr>
                                                <td style='background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); padding: 40px 20px; text-align: center;'>
                                                    <h1 style='color: #ffffff; margin: 0; font-size: 28px;'>SkillLink</h1>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='padding: 40px 30px;'>
                                                    <h2 style='color: #1f2937; margin: 0 0 20px 0; font-size: 24px;'>{title}</h2>
                                                    <p style='color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;'>{message}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style='background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;'>
                                                    <p style='color: #9ca3af; font-size: 12px; margin: 0;'>© 2026 SkillLink. Todos los derechos reservados.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    "
                };

                var emailJson = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(emailPayload),
                    Encoding.UTF8,
                    "application/json"
                );

                var emailResponse = await client.PostAsync($"{notificationServiceUrl}/api/notifications/send-email", emailJson);
                
                if (emailResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"✅ Email notification sent to {email}");
                }
                else
                {
                    Console.WriteLine($"⚠️ Failed to send email notification to {email}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error enviando notificación: {ex.Message}");
            }
        }
    }
}