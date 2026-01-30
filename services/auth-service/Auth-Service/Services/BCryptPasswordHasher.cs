using Microsoft.AspNetCore.Identity;
using Auth_Service.Models;
using BCrypt.Net;

namespace Auth_Service.Services
{
    public class BCryptPasswordHasher : IPasswordHasher<User>
    {
        // 1. When creating a user: Hash with BCrypt
        public string HashPassword(User user, string password)
        {
   
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // 2. When logging in: Verify with BCrypt
        public PasswordVerificationResult VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
        {
            try
            {
                // Verify if the password matches the hash
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
                // If the format is not valid (just in case), fail the verification
                return PasswordVerificationResult.Failed;
            }
        }
    }
}