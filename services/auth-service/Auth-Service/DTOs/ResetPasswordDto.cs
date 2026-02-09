namespace Auth_Service.DTOs
{
    public class ResetPasswordDto
    {
        public string email { get; set; }
        public string code { get; set; }
        public string newPassword { get; set; }
    }
}
