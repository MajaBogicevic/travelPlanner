using AuthService.DTO.Auth;
using AuthService.DTO.User;

namespace AuthService.Services
{
    public interface IAuthService
    {
        Task<AuthResultDto> RegisterAsync(RegisterDto dto);
        Task<AuthResultDto> LoginAsync(LoginDto dto);
        Task<UserResponseDto?> GetUserByIdAsync(int id);
    }
}