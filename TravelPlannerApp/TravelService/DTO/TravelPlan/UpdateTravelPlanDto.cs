using System.ComponentModel.DataAnnotations;

namespace TravelService.DTO.TravelPlan
{
    public class UpdateTravelPlanDto
    {
        [Required(ErrorMessage = "Naziv je obavezan")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Budzet ne može biti negativan")]
        public decimal Budget { get; set; }
        public string? Notes { get; set; }
    }
}
