using TravelService.DTO.TravelPlan;

namespace TravelService.DTOs.Share
{
    public class SharedPlanResponseDto
    {
        public TravelPlanResponseDto Plan { get; set; } = null!;
        public string AccessType { get; set; } = string.Empty;
    }
}