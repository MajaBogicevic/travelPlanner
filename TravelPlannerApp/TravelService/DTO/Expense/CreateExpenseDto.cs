using System.ComponentModel.DataAnnotations;
using TravelService.Models;

namespace TravelService.DTO.Expense
{
    public class CreateExpenseDto
    {
        [Required] public string Name { get; set; } = string.Empty;
        public ExpenseCategory Category { get; set; }
        [Range(0, double.MaxValue)] public decimal Amount { get; set; }
        [Required] public DateTime Date { get; set; }
        public string? Description { get; set; }
    }
}
