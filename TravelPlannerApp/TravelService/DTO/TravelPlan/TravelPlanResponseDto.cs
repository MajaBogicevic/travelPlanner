using System.ComponentModel.DataAnnotations;
using TravelService.DTO.Activiry;
using TravelService.DTO.Checklist;
using TravelService.DTO.Destination;
using TravelService.DTO.Expense;

namespace TravelService.DTO.TravelPlan
{
    public class TravelPlanResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingBudget { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<DestinationResponseDto> Destinations { get; set; } = new();
        public List<ActivityResponseDto> Activities { get; set; } = new();
        public List<ExpenseResponseDto> Expenses { get; set; } = new();
        public List<ChecklistItemDto> ChecklistItems { get; set; } = new();
        public int UserId { get; set; }
    }
}
