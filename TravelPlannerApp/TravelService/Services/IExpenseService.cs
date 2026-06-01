using TravelService.DTO.Expense;

namespace TravelService.Services
{
    public interface IExpenseService
    {
        Task<List<ExpenseResponseDto>> GetAllAsync(int planId, int userId);
        Task<ExpenseResponseDto> CreateAsync(int planId, CreateExpenseDto dto, int userId);
        Task<ExpenseResponseDto?> UpdateAsync(int id, int planId, UpdateExpenseDto dto, int userId);
        Task<bool> DeleteAsync(int id, int planId, int userId);
    }
}