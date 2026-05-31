using System.ComponentModel.DataAnnotations;

namespace AuthService.DTO.User
{
    public class UpdateRoleDto
    {
        [Required] public string Role { get; set; } = string.Empty;

    }
}
