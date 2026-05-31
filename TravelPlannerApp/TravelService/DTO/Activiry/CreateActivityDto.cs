using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.DTO.Activiry
{
    public class CreateActivityDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required] public DateTime Date { get; set; }
        public string? Time { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Description { get; set; }
        [Range(0, double.MaxValue)] public decimal? EstimatedCost { get; set; }
        public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
    }
}
