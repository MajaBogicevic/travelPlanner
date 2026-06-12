using AuthService.Data;
using AuthService.DTO.Auth;
using AuthService.DTO.User;
using AuthService.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthService.Services
{
    public class AuthServiceImpl : IAuthService
    {
        private readonly AuthDbContext db;
        private readonly IMapper mapper;
        private readonly IConfiguration config;

        public AuthServiceImpl(AuthDbContext db, IMapper mapper, IConfiguration config)
        {
            this.db = db;
            this.mapper = mapper;
            this.config = config;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
        {
            bool emailExists = await db.Users.AnyAsync(u => u.Email == dto.Email);

            if (emailExists)
            {
                var errorResult = new AuthResultDto();
                errorResult.Success = false;
                errorResult.Message = "Email već postoji";
                return errorResult;
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User();
            newUser.Name = dto.Name;
            newUser.Email = dto.Email;
            newUser.PasswordHash = hashedPassword;
            newUser.Role = UserRole.User;

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            string token = GenerateJwtToken(newUser);

            var result = new AuthResultDto();
            result.Success = true;
            result.Token = token;
            result.UserId = newUser.Id;
            result.Role = newUser.Role.ToString();

            return result;
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto dto)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return new AuthResultDto { Success = false, Message = "Pogrešni podaci" };

            return new AuthResultDto
            {
                Success = true,
                Token = GenerateJwtToken(user),
                UserId = user.Id,
                Role = user.Role.ToString()
            };
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(int id)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null)
            {
                return null;
            }
            else
            {
                return mapper.Map<UserResponseDto>(user);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var secret = config["JwtSettings:Secret"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: "TravelPlannerAPI",
                audience: "TravelPlannerClient",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
