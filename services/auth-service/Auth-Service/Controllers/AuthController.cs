using Microsoft.AspNetCore.Mvc;
using AuthService.Data;
using AuthService.Models;
using AuthService.DTOs;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            // Validar que el userType sea válido
            if (model.userType != "client" && model.userType != "provider")
            {
                return BadRequest(new { message = "El tipo de usuario debe ser 'client' o 'provider'." });
            }

            if (await _context.users.AnyAsync(u => u.email == model.email))
            {
                return BadRequest(new { message = "El correo ya está registrado." });
            }

            var newUser = new User
            {
                email = model.email,
                password_hash = BCrypt.Net.BCrypt.HashPassword(model.password),
                phone_number = model.phoneNumber,
                user_type = model.userType,
                is_active = true,
                created_at = DateTime.Now
            };

            _context.users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "¡Usuario registrado exitosamente en SkillLink!",
                userId = newUser.user_id,
                userType = newUser.user_type,
                requiresProviderProfile = newUser.user_type == "provider"
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // 1. Buscar al usuario
            var user = await _context.users.FirstOrDefaultAsync(u => u.email == model.Email);

            // 2. Valida credenciales con BCrypt
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.password_hash))
            {
                return Unauthorized(new { message = "Correo o contraseña incorrectos." });
            }

            // 3. Obtener clave del appsettings y validar que no sea nula
            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey)) return StatusCode(500, "Error de configuración en el servidor (JWT Key)");

            // 4. Crear los Claims
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim("IsActive", user.is_active.ToString())
            };

            // 5. Genera el Token
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );

            // 6. Respuesta con el Token
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                userId = user.user_id,
                email = user.email,
                userType = user.user_type,
                message = "Login exitoso"
            });
        }
    }
}