using System.ComponentModel.DataAnnotations;

namespace TravelService.DTO.Share
{
    public class CreateShareDto
    {
        [Required] public string AccessType { get; set; } = string.Empty;

    }
}
