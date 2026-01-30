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
  
            var userExists = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = "El usuario ya existe!" });

 
            User user = new User()
            {
                UserName = model.email,
                Email = model.email,
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
    }
}