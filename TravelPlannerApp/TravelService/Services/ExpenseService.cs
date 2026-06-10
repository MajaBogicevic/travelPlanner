using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.DTO.Expense;
using TravelService.Models;
namespace TravelService.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly TravelDbContext _db;
        private readonly IMapper _mapper;
        public ExpenseService(TravelDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        private async Task<bool> HasAccessAsync(int planId, int userId)
        {
            return await _db.TravelPlans.AnyAsync(p => p.Id == planId && p.UserId == userId)
                || await _db.PlanAccesses.AnyAsync(a => a.TravelPlanId == planId && a.UserId == userId);
        }

        public async Task<List<ExpenseResponseDto>> GetAllAsync(int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return new List<ExpenseResponseDto>();
            var expenses = await _db.Expenses
                .Where(e => e.TravelPlanId == planId)
                .ToListAsync();
            return _mapper.Map<List<ExpenseResponseDto>>(expenses);
        }

        public async Task<ExpenseResponseDto> CreateAsync(int planId, CreateExpenseDto dto, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) throw new KeyNotFoundException("Plan nije pronadjen");
            var expense = _mapper.Map<Expense>(dto);
            expense.TravelPlanId = planId;
            _db.Expenses.Add(expense);
            await _db.SaveChangesAsync();
            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<ExpenseResponseDto?> UpdateAsync(int id, int planId, UpdateExpenseDto dto, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return null;
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId);
            if (expense == null) return null;
            _mapper.Map(dto, expense);
            await _db.SaveChangesAsync();
            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<bool> DeleteAsync(int id, int planId, int userId)
        {
            if (!await HasAccessAsync(planId, userId)) return false;
            var expense = await _db.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.TravelPlanId == planId);
            if (expense == null) return false;
            _db.Expenses.Remove(expense);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}