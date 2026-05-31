namespace AuthService.DTO.Auth
{
    public class AuthResultDto
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public int UserId { get; set; }
        public string? Role { get; set; }
        public string? Message { get; set; }
    }
}
