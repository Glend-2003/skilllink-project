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
            // 1. Verificar si existe (Manual)
            var userExists = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "El usuario ya existe!" });

            // 2. Crear Objeto User
            User user = new User()
            {
                Email = model.email,
                // UserName = model.email, // Ya no es necesario si no usas Identity interno
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // 3. ENCRIPTAR CONTRASEÑA MANUALMENTE (Usando BCrypt)
            // Esto evita que CreateAsync busque columnas que no existen
            user.PasswordHash = _passwordHasher.HashPassword(user, model.password);

            try 
            {
                // 4. GUARDAR USUARIO (Directo a la BD)
                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Aquí se genera el ID automático

                // 5. ASIGNAR ROL (Directo a la tabla intermedia)
                // Asumimos que el Rol ID 1 es "Client". 
                var userRole = new UserRole 
                { 
                    UserId = user.Id, 
                    RoleId = 1 
                };
                
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();

                return Ok(new { Status = "Success", Message = "Usuario creado exitosamente!" });
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { Status = "Error", Message = "Error guardando en BD", Detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            // 1. Buscamos usuario E INCLUIMOS la tabla de roles
            var user = await _context.Users
                .Include(u => u.UserRoles) // Traer tabla intermedia
                .ThenInclude(ur => ur.Role) // Traer nombre del rol
                .FirstOrDefaultAsync(u => u.Email == model.email);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.password))
            {
                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                };

                // 2. Sacamos los roles de la lista cargada
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

                return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            }
            return Unauthorized();
        }
    }
}