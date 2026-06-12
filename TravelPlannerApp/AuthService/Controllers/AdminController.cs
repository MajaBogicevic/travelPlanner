using AuthService.Data;
using AuthService.DTO.User;
using AuthService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AuthDbContext db;

        public AdminController(AuthDbContext db)
        {
            this.db = db;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await db.Users.Select(u => 
            new UserAdminDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role.ToString(),
                CreatedAt = u.CreatedAt
            }).ToListAsync();

            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) 
                return NotFound();

            user.Role = Enum.Parse<UserRole>(dto.Role);
            await db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) 
                return NotFound();

            db.Users.Remove(user);
            await db.SaveChangesAsync();
            return NoContent();
        }
    }
}
