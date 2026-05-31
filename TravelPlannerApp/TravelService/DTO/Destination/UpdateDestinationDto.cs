using System.ComponentModel.DataAnnotations;

namespace TravelService.DTO.Destination
{
    public class UpdateDestinationDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Location { get; set; }
        [Required] public DateTime ArrivalDate { get; set; }
        [Required] public DateTime DepartureDate { get; set; }
        public string? Description { get; set; }
    }
}
