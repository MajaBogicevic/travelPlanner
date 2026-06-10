namespace TravelService.Models
{
    public class PlanAccess
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public TravelPlan TravelPlan { get; set; } = null!;
        public int UserId { get; set; }
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
    }
}