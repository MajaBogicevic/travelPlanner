namespace TravelService.Models
{
    public class ChecklistItem
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public int TravelPlanId { get; set; }
        public TravelPlan TravelPlan { get; set; } = null!;
    }
}
