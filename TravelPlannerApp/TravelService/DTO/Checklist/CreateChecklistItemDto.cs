using System.ComponentModel.DataAnnotations;

namespace TravelService.DTO.Checklist
{
    public class CreateChecklistItemDto
    {
        [Required] public string Text { get; set; } = string.Empty;

    }
}
