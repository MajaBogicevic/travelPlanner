using AuthService.Data;
using AuthService.DTO.Auth;
using AuthService.DTO.User;
using AuthService.Models.TravelService.Models;
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
        private readonly AuthDbContext _db;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public AuthServiceImpl(AuthDbContext db, IMapper mapper, IConfiguration config)
        {
            _db = db;
            _mapper = mapper;
            _config = config;
        }

        public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return new AuthResultDto { Success = false, Message = "Email već postoji" };

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = UserRole.User
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return new AuthResultDto
            {
                Success = true,
                Token = GenerateJwtToken(user),
                UserId = user.Id,
                Role = user.Role.ToString()
            };
        }

        public async Task<AuthResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

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
            var user = await _db.Users.FindAsync(id);
            return user == null ? null : _mapper.Map<UserResponseDto>(user);
        }

        private string GenerateJwtToken(User user)
        {
            var secret = _config["JwtSettings:Secret"]!;
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
