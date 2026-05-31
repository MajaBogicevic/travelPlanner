namespace TravelService.Models
{
    public class SharedPlan
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public ShareAccessType AccessType { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int TravelPlanId { get; set; }
        public TravelPlan TravelPlan { get; set; } = null!;
    }

    public enum ShareAccessType { View, Edit }
}
