namespace AuthService.DTOs
{
    public class RegisterDto
    {
        public string email { get; set; }
        public string password { get; set; }
        public string? phoneNumber { get; set; }
        public string userType { get; set; } // "client" o "provider"
    }
}