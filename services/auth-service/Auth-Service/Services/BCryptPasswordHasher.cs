using Microsoft.AspNetCore.Identity;
using Auth_Service.Models;
using BCrypt.Net;

namespace Auth_Service.Services
{
    public class BCryptPasswordHasher : IPasswordHasher<User>
    {
        // 1. Al registrarse: Encriptar con BCrypt
        public string HashPassword(User user, string password)
        {
            // Genera el hash tipo $2a$11$...
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // 2. Al loguearse: Verificar con BCrypt
        public PasswordVerificationResult VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
        {
            try
            {
                // Verificar si la contraseña coincide con el hash
                bool isValid = BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword);

                if (isValid)
                {
                    return PasswordVerificationResult.Success;
                }
                else
                {
                    return PasswordVerificationResult.Failed;
                }
            }
            catch
            {
                // Si el formato no es válido (por si acaso), fallamos
                return PasswordVerificationResult.Failed;
            }
        }
    }
}