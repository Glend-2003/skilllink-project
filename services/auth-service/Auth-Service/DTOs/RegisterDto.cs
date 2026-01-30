namespace Auth_Service.DTOs
{
    public class RegisterDto
    {
        public string email { get; set; }
        public string password { get; set; }
        public string? phoneNumber { get; set; }
        public string userType { get; set; }
    }
}